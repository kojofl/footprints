use std::fs;

use anyhow::{Context, Result};
use tauri::{path::BaseDirectory, AppHandle, Manager};

pub struct ImageManager {
    images: Vec<Image>,
}

type Image = Vec<u8>;

impl ImageManager {
    pub fn init(app: AppHandle) -> Result<Self> {
        let path = app
            .path()
            .resolve("resources/images/", BaseDirectory::Resource)
            .context("Image folder not found")?;

        let mut v = Vec::new();
        for entry in fs::read_dir(&path).context("Failed to open image folder")? {
            let Ok(entry) = entry else {
                continue;
            };
            let pic = fs::read(entry.path())?;
            v.push(pic);
        }

        Ok(Self { images: v })
    }

    pub fn get_rand_image(&self) -> &Image {
        let index: u64 = rand::random();
        &self.images[index as usize % self.images.len()]
    }
}
