use tauri::{
    ipc::{Channel, Response},
    AppHandle, Manager, State,
};

use crate::{image_manager::ImageManager, loading_manager::LoadingManager};
use serde::Serialize;
use std::time::Duration;

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
#[derive(Clone, Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
pub enum LoadingEvent {
    Update { val: f64 },
    Finish,
}

#[tauri::command]
pub fn register_loading_bar(
    step_size: f64,
    on_event: Channel<LoadingEvent>,
    m: State<'_, LoadingManager>,
) {
    println!("register");
    tauri::async_runtime::spawn(async move {
        let step_size = step_size * 0.4;
        let mut interval = tokio::time::interval(Duration::from_millis(2));
        let mut v: f64 = 0.0;
        loop {
            interval.tick().await;
            v += step_size;
            if v >= 100.0 {
                on_event.send(LoadingEvent::Finish).unwrap();
                break;
            }
            on_event.send(LoadingEvent::Update { val: v }).unwrap()
        }
    });
}

#[tauri::command]
pub fn stop_loading_bar(m: State<'_, LoadingManager>) {
    println!("stop");
    m.stop()
}
