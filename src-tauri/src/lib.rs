use tauri::async_runtime::spawn;
use tauri::{AppHandle, Manager};
use tokio::time::{sleep, Duration};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            spawn(setup(app.handle().clone()));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello {name} from Rust!")
}

async fn setup(app: AppHandle) -> Result<(), ()> {
    // Fake performing some heavy action for 3 seconds
    println!("Performing really heavy backend setup task...");
    sleep(Duration::from_secs(3)).await;
    println!("Backend setup task completed!");
    let splash_window = app.get_webview_window("splashscreen").unwrap();
    let main_window = app.get_webview_window("main").unwrap();
    splash_window.close().unwrap();
    main_window.show().unwrap();
    Ok(())
}
