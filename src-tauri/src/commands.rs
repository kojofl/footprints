use tauri::{path::BaseDirectory, AppHandle, Manager, State};

use crate::{
    image_manager::{Image, ImageManager},
    logger::Logger,
    lsl::{LsLEvent, LsLManager},
};
use std::sync::Mutex;

#[tauri::command]
pub fn get_image(init: bool, state: State<'_, Mutex<ImageManager>>) -> Image {
    state.lock().unwrap().get_rand_image(init).clone()
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

#[tauri::command]
pub fn play_sound(app: AppHandle) {
    let mut path = app
        .path()
        .resolve("resources/music/", BaseDirectory::Resource)
        .expect("music folder to be present");
    let stream_handle = rodio::OutputStreamBuilder::open_default_stream().unwrap();
    let sink = rodio::Sink::connect_new(stream_handle.mixer());
    path.push("start-13691.mp3");
    let file = std::fs::File::open(path).unwrap();
    sink.append(rodio::Decoder::try_from(file).unwrap());

    sink.sleep_until_end();
}
