use tauri::{ipc::Response, State};

use crate::image_manager::ImageManager;

#[tauri::command]
pub fn get_image(state: State<'_, ImageManager>) -> Response {
    Response::new(state.inner().get_rand_image().clone())
}
