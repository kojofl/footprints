use crate::commands::LoadingEvent;
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::{async_runtime::JoinHandle, ipc::Channel};

#[derive(Clone)]
pub struct LoadingManager {
    handle: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl LoadingManager {
    pub fn new() -> Self {
        Self {
            handle: Arc::new(Mutex::new(None)),
        }
    }
    pub fn register(&self, init: f64, step_size: f64, on_event: Channel<LoadingEvent>) {
        self.stop();
        let handle = tauri::async_runtime::spawn(async move {
            let step_size = step_size * 0.4;
            let mut interval = tokio::time::interval(Duration::from_millis(2));
            let mut v: f64 = init;
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
        let _ = self.handle.try_lock().unwrap().insert(handle);
    }
    pub fn stop(&self) {
        let Some(handle) = self.handle.try_lock().unwrap().take() else {
            return;
        };
        handle.abort();
    }
}
