use tauri::{AppHandle, Manager, State};

use crate::{
    image_manager::{Image, ImageManager},
    lsl::{LsLEvent, LsLManager},
};

#[tauri::command]
pub fn get_image(state: State<'_, ImageManager>) -> Image {
    state.inner().get_rand_image().clone()
}

#[tauri::command]
pub fn open_calibration(app: AppHandle) {
    let calibration_window = app.get_webview_window("calibration").unwrap();
    calibration_window.show().unwrap();
    calibration_window.unminimize().unwrap();
    calibration_window.set_focus().unwrap();
}

#[tauri::command]
pub fn publish_lsl(event: LsLEvent, state: State<'_, LsLManager>) {
    state.publish_event(event).expect("Lsl worker crashed");
}
