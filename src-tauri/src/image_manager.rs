use std::fs;

use crate::rand::Alias;
use anyhow::{Context, Result};
use serde::Serialize;
use tauri::{path::BaseDirectory, AppHandle, Manager};

pub struct ImageManager {
    dist: Alias<4>,
    images: Quadrants,
}

struct Quadrants {
    low_low: Vec<Image>,
    low_high: Vec<Image>,
    high_low: Vec<Image>,
    high_high: Vec<Image>,
}

#[derive(Serialize, Clone)]
pub struct Image {
    name: String,
    data: Vec<u8>,
}

impl ImageManager {
    pub fn init(app: AppHandle) -> Result<Self> {
        let path = app
            .path()
            .resolve("resources/images/", BaseDirectory::Resource)
            .context("Image folder not found")?;

        let mut low_low = Vec::new();
        let mut ll_p = path.clone();
        ll_p.push("low_low");
        for entry in fs::read_dir(ll_p).context("Failed to open image folder")? {
            let Ok(entry) = entry else {
                continue;
            };
            let pic = fs::read(entry.path())?;
            low_low.push(Image {
                name: entry.file_name().to_string_lossy().to_string(),
                data: pic,
            });
        }
        let mut low_high = Vec::new();
        let mut lh_p = path.clone();
        lh_p.push("low_high");
        for entry in fs::read_dir(lh_p).context("Failed to open image folder")? {
            let Ok(entry) = entry else {
                continue;
            };
            let pic = fs::read(entry.path())?;
            low_high.push(Image {
                name: entry.file_name().to_string_lossy().to_string(),
                data: pic,
            });
        }
        let mut high_low = Vec::new();
        let mut hl_p = path.clone();
        hl_p.push("high_low");
        for entry in fs::read_dir(hl_p).context("Failed to open image folder")? {
            let Ok(entry) = entry else {
                continue;
            };
            let pic = fs::read(entry.path())?;
            high_low.push(Image {
                name: entry.file_name().to_string_lossy().to_string(),
                data: pic,
            });
        }
        let mut high_high = Vec::new();
        let mut hh_p = path.clone();
        hh_p.push("high_high");
        for entry in fs::read_dir(hh_p).context("Failed to open image folder")? {
            let Ok(entry) = entry else {
                continue;
            };
            let pic = fs::read(entry.path())?;
            high_high.push(Image {
                name: entry.file_name().to_string_lossy().to_string(),
                data: pic,
            });
        }

        let dist = Alias::new(&[0.25; 4]);
        let q = Quadrants {
            low_low,
            low_high,
            high_low,
            high_high,
        };

        Ok(Self { dist, images: q })
    }

    pub fn get_rand_image(&self) -> &Image {
        let q = self.dist.generate();
        debug_assert!(q < 4);
        let i = match q {
            0 => &self.images.low_low,
            1 => &self.images.low_high,
            2 => &self.images.high_low,
            3 => &self.images.high_high,
            _ => unreachable!(),
        };
        let index: u64 = rand::random();
        &i[index as usize % i.len()]
    }
}
