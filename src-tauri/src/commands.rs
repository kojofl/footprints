use tauri::{ipc::Response, AppHandle, Manager, State};

use crate::image_manager::ImageManager;

#[tauri::command]
pub fn get_image(state: State<'_, ImageManager>) -> Response {
    Response::new(state.inner().get_rand_image().clone())
}

#[tauri::command]
pub fn open_calibration(app: AppHandle) {
    let calibration_window = app.get_webview_window("calibration").unwrap();
    calibration_window.show().unwrap();
    calibration_window.unminimize().unwrap();
    calibration_window.set_focus().unwrap();
}
