pub mod wallpaper;

use tauri::{
  menu::{MenuBuilder, MenuItemBuilder},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  App, AppHandle, Emitter, Manager, WebviewWindow, WindowEvent,
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
fn set_wallpaper(app: AppHandle, path: &str) {
  let home_res = app.path().home_dir();
  let home_buff = home_res.unwrap();
  let home = home_buff.to_str().unwrap().to_string();
  let _ = wallpaper::set(path.to_string(), home);
}

#[tauri::command]
fn get_wallpaper() -> Option<String> {
  let result = wallpaper::get();
  if let Some(path) = result {
    return Some(path);
  }
  return None;
}

fn move_window_initial(window: &WebviewWindow) {
  #[cfg(target_os = "macos")]
  window.move_window(Position::TopRight).unwrap();
  #[cfg(target_os = "windows")]
  window.move_window(Position::BottomRight).unwrap();
}

fn move_window_tray(window: &WebviewWindow) {
  #[cfg(target_os = "macos")]
  window.move_window(Position::TrayCenter).unwrap();
  #[cfg(target_os = "windows")]
  {
    window.move_window(Position::TrayCenter).unwrap();
    let current_position = window.outer_position().unwrap();
    let offset_position = tauri::PhysicalPosition {
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

fn build_tray_app(app: &mut App) {
  let quit = MenuItemBuilder::with_id("quit", "Quit").build(app).unwrap();
  let menu = MenuBuilder::new(app).items(&[&quit]).build().unwrap();
  let _ = TrayIconBuilder::new()
    .menu(&menu)
    .menu_on_left_click(false)
    .on_menu_event(move |_, event| match event.id().as_ref() {
      "quit" => {
        std::process::exit(0);
      }
      _ => (),
    })
    .on_tray_icon_event(|tray, event| {
      let app = tray.app_handle();
      let window = app.get_webview_window("main").unwrap();
      tauri_plugin_positioner::on_tray_event(app, &event);
      if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
      } = event
      {
        move_window_tray(&window);
        if window.is_visible().unwrap() {
          window.hide().unwrap();
        } else {
          window.show().unwrap();
          window.set_focus().unwrap();
        }
      }
      if let TrayIconEvent::Click {
        button: MouseButton::Right,
        button_state: MouseButtonState::Up,
        ..
      } = event
      {
        if window.is_visible().unwrap() {
          window.hide().unwrap();
        }
      }
    })
    .icon_as_template(true)
    .icon(tauri::image::Image::from_bytes(include_bytes!("../tray/icon-tray.png")).unwrap())
    .build(app)
    .unwrap();
}

pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_positioner::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .setup(|app| {
      build_tray_app(app);
      let window = app.get_webview_window("main").unwrap();
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
    .on_window_event(|window, event| match event {
      WindowEvent::Focused(_focused) => {
        if !_focused {
          unsafe {
            if IS_DIALOG_OPEN {
              IS_DIALOG_OPEN = false;
              return;
            }
            if window.is_visible().unwrap() {
              window.hide().unwrap();
            }
          }
        }
      }
      _ => (),
    })
    .invoke_handler(tauri::generate_handler![
      set_wallpaper,
      get_wallpaper,
      set_dialog_open
    ])
    .run(tauri::generate_context!())
    .expect("Error while running Paper Brick");
}
