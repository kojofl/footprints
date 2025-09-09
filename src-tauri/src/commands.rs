use tauri::{AppHandle, Manager, State};

use crate::{
    image_manager::{Image, ImageManager},
    logger::Logger,
    lsl::{LsLEvent, LsLManager},
};
use std::sync::Mutex;

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
pub fn publish_lsl(
    event: LsLEvent,
    state: State<'_, LsLManager>,
    logger: State<'_, Mutex<Logger>>,
) {
    state.publish_event(event).expect("Lsl worker crashed");
    let mut logger = logger.lock().unwrap();
    match event {
        LsLEvent::Baseline => logger.current.baseline(),
        LsLEvent::Stimulus => logger.current.stimulus(),
        LsLEvent::Movement => logger.current.go(),
        LsLEvent::Rating => logger.current.rating(),
        _ => {}
    }
}
