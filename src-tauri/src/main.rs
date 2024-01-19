// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
use tauri_plugin_positioner::{self, Position, WindowExt};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn change_wallpaper(name: &str) {
  let path = format!("Users/irwinarruda/Pictures/{}", name.to_string());
  wallpaper::set_from_path(path.as_str()).unwrap();
}

fn create_tray_menu() -> SystemTray {
  let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");
  let tray_menu = SystemTrayMenu::new().add_item(quit);
  let tray = SystemTray::new().with_menu(tray_menu);
  return tray;
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_positioner::init())
    .system_tray(create_tray_menu())
    .on_system_tray_event(|app, event| {
      tauri_plugin_positioner::on_tray_event(app, &event);
      let window = app.get_window("main").unwrap();
      window.move_window(Position::TrayCenter).unwrap();
      match event {
        SystemTrayEvent::LeftClick { .. } => {
          let window = app.get_window("main").unwrap();
          let _ = window.move_window(Position::TrayCenter);
          if window.is_visible().unwrap() {
            window.hide().unwrap();
          } else {
            window.show().unwrap();
            window.set_focus().unwrap();
          }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          _ => (),
        },
        _ => (),
      }
    })
    .on_window_event(|app| match app.event() {
      WindowEvent::Focused(_focused) =>
      {
        #[cfg(production)]
        if !_focused {
          let window = app.window();
          if window.is_visible().unwrap() {
            window.hide().unwrap();
          }
        }
      }
      _ => (),
    })
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      window.move_window(Position::TopRight).unwrap();
      #[cfg(target_os = "macos")]
      apply_vibrancy(
        &window,
        NSVisualEffectMaterial::HudWindow,
        Some(NSVisualEffectState::Active),
        Some(7.0),
      )
      .expect("Unsupported platform! Only macOS is supported!");
      return Ok(());
    })
    .invoke_handler(tauri::generate_handler![greet])
    .invoke_handler(tauri::generate_handler![change_wallpaper])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
