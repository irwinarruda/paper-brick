use regex::Regex;
use std::{borrow::Cow, fs, process::Command};

pub fn get() -> Option<String> {
  let result = wallpaper::get();
  if let Ok(item) = result {
    return Some(item);
  }
  return None;
}

fn get_application_support_path() -> Option<String> {
  let home_opt = tauri::api::path::home_dir();
  if home_opt.is_none() {
    return None;
  }
  let home = home_opt?;
  let home_path_opt = home.to_str();
  if home_path_opt.is_none() {
    return None;
  }
  let home_path = home_path_opt?;
  let application_support_path = format!(
    "{}/Library/Application Support/com.apple.wallpaper/Store",
    home_path
  );
  return Some(application_support_path);
}

fn replace_file(file: String, path: String) -> Result<String, std::io::Error> {
  let regex_res = Regex::new(r"<string>file:\/\/(.*)<\/string>");
  if regex_res.is_err() {
    return Err(std::io::Error::new(
      std::io::ErrorKind::Other,
      regex_res.unwrap_err().to_string(),
    ));
  }
  let regex = regex_res.unwrap();
  let replaced = regex.replace_all(file.as_str(), format!("<string>file://{}</string>", path));
  if let Cow::Owned(file_result) = replaced {
    return Ok(file_result);
  }
  return Err(std::io::Error::new(
    std::io::ErrorKind::Other,
    "Error replacing file",
  ));
}

fn set_plist_wallpaper(path: String) -> Result<(), std::io::Error> {
  let application_support_opt = get_application_support_path();
  if application_support_opt.is_none() {
    return Err(std::io::Error::new(
      std::io::ErrorKind::Other,
      "Application support path not found",
    ));
  }
  let application_support = application_support_opt.unwrap();
  let application_plist = format!("{}/Index.plist", application_support);
  let application_xml = format!("{}/Index.xml", application_support);
  let _ = Command::new("plutil")
    .arg("-convert")
    .arg("xml1")
    .arg(&application_plist)
    .arg("-o")
    .arg(&application_xml)
    .output()?;
  let file = fs::read_to_string(&application_xml)?;
  let file_replaced = replace_file(file, path)?;
  fs::write(&application_xml, file_replaced)?;
  Command::new("plutil")
    .arg("-convert")
    .arg("binary1")
    .arg(&application_xml)
    .arg("-o")
    .arg(&application_plist)
    .output()?;
  fs::remove_file(&application_xml)?;
  Command::new("killall").arg("WallpaperAgent").output()?;
  return Ok(());
}

fn set_wallpaper_oascript(path: String) -> Result<(), std::io::Error> {
  Command::new("osascript")
    .arg("-e")
    .arg(format!("tell application \"System Events\" to tell every desktop to set picture to \"{}\" as POSIX file", path))
   .output()?;
  Command::new("osascript")
    .arg("ge")
    .arg("tell application \"Application Suport\" to tell to set Type to \"individual\"")
    .output()?;

  return Ok(());
}

pub fn set(path: String) -> Result<(), std::io::Error> {
  #[cfg(target_os = "macos")]
  {
    let plist = set_plist_wallpaper(path.clone());
    if !plist.is_err() {
      return Ok(());
    }
  }

  if let Err(err) = wallpaper::set_from_path(path.as_str()) {
    return Err(std::io::Error::new(
      std::io::ErrorKind::Other,
      err.to_string(),
    ));
  }

  return Ok(());
}
