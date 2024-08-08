// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod wallpaper;

use tauri::{
  CustomMenuItem, Manager, PhysicalPosition, SystemTray, SystemTrayEvent, SystemTrayMenu, Window,
  WindowEvent,
};
use tauri_plugin_positioner::{self, Position, WindowExt};

static mut IS_DIALOG_OPEN: bool = false;

#[tauri::command]
fn set_dialog_open() {
  unsafe {
    IS_DIALOG_OPEN = true;
  }
}

#[tauri::command]
fn set_wallpaper(path: &str) {
  let _ = wallpaper::set(path.to_string());
}

#[tauri::command]
fn get_wallpaper() -> Option<String> {
  let result = wallpaper::get();
  if let Some(path) = result {
    return Some(path);
  }
  return None;
}

fn move_window_initial(window: &Window) {
  #[cfg(target_os = "macos")]
  window.move_window(Position::TopRight).unwrap();
  #[cfg(target_os = "windows")]
  window.move_window(Position::BottomRight).unwrap();
}

fn move_window_tray(window: &Window) {
  #[cfg(target_os = "macos")]
  window.move_window(Position::TrayCenter).unwrap();
  #[cfg(target_os = "windows")]
  {
    window.move_window(Position::TrayCenter).unwrap();
    let current_position = window.outer_position().unwrap();
    let offset_position = PhysicalPosition {
      x: current_position.x - 70,
      y: current_position.y,
    };
    window
      .set_position(tauri::Position::Physical(offset_position))
      .unwrap();
    window
      .emit("window_tray_position", offset_position.y)
      .unwrap();
  }
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
      match event {
        SystemTrayEvent::LeftClick { .. } => {
          let window = app.get_window("main").unwrap();
          move_window_tray(&window);
          if window.is_visible().unwrap() {
            window.hide().unwrap();
          } else {
            window.show().unwrap();
            window.set_focus().unwrap();
          }
        }
        SystemTrayEvent::RightClick { .. } => {
          let window = app.get_window("main").unwrap();
          if window.is_visible().unwrap() {
            window.hide().unwrap();
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
      WindowEvent::Focused(_focused) => {
        if !_focused {
          unsafe {
            if IS_DIALOG_OPEN {
              IS_DIALOG_OPEN = false;
              return;
            }
            let window = app.window();
            if window.is_visible().unwrap() {
              window.hide().unwrap();
            }
          }
        }
      }
      _ => (),
    })
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      window_shadows::set_shadow(&window, true).expect("Unsupported platform!");
      move_window_initial(&window);
      #[cfg(target_os = "macos")]
      {
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        window_vibrancy::apply_vibrancy(
          &window,
          window_vibrancy::NSVisualEffectMaterial::HudWindow,
          Some(window_vibrancy::NSVisualEffectState::Active),
          Some(7.0),
        )
        .expect("Unsupported platform!");
      }
      #[cfg(target_os = "windows")]
      window_vibrancy::apply_acrylic(&window, None).expect("Unsupported platform!");
      return Ok(());
    })
    .invoke_handler(tauri::generate_handler![
      set_wallpaper,
      get_wallpaper,
      set_dialog_open
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
