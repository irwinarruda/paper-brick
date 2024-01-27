use std::process::Command;

pub fn get() -> Option<String> {
  let result = Command::new("osascript")
    .arg("-e")
    .arg("tell application \"Finder\" to get POSIX path of (get desktop picture as alias)")
    .output();
  if let Ok(output) = result {
    let result = String::from_utf8(output.stdout);
    if let Ok(path) = result {
      return Some(path);
    }
  }
  return None;
}

pub fn set(path: String) {
  let _ = Command::new("osascript")
    .arg("-e")
    .arg(format!("tell application \"System Events\" to tell every desktop to set picture to \"{}\" as POSIX file", path))
    .output();
  return;
}
