mod commands;
mod image_manager;

use anyhow::{Context, Result};
use commands::get_image;
use image_manager::ImageManager;
use tauri::async_runtime::spawn;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager};
use tokio::time::{sleep, Duration};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<()> {
    let mut builder = tauri::Builder::default();
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }
    builder
        .invoke_handler(tauri::generate_handler![get_image])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            let app_clone = app.handle().clone();
            spawn(async move {
                if let Err(e) = setup(app_clone.clone()).await {
                    println!("{:?}", e);
                    app_clone.exit(1);
                }
            });
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let open_i = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open_i, &quit_i])?;
            TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "open" => {
                        let main_window = app.get_webview_window("main").unwrap();
                        main_window.show().unwrap();
                        main_window.set_focus().unwrap();
                    }
                    _ => panic!("Handler for event: {:?} not implemented", event.id()),
                })
                .on_tray_icon_event(|tray, event| match event {
                    tauri::tray::TrayIconEvent::DoubleClick { .. } => {
                        let app = tray.app_handle();
                        let main_window = app.get_webview_window("main").unwrap();
                        main_window.show().unwrap();
                        main_window.set_focus().unwrap();
                    }
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .with_context(|| "error while running tauri application")?;
    Ok(())
}

async fn setup(app: AppHandle) -> Result<()> {
    // Fake performing some heavy action for 3 seconds
    println!("Performing really heavy backend setup task...");
    let image_manager = match ImageManager::init(app.clone()) {
        Ok(m) => m,
        Err(e) => panic!("{e:?}"),
    };
    app.manage(image_manager);
    sleep(Duration::from_secs(3)).await;
    println!("Backend setup task completed!");
    let splash_window = app.get_webview_window("splashscreen").unwrap();
    let main_window = app.get_webview_window("main").unwrap();
    splash_window.close().unwrap();
    main_window.show().unwrap();
    Ok(())
}
