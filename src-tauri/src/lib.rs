use std::path::PathBuf;

use dirs::download_dir;
use udownload::download;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn handle_download(download_url: &str, filename: &str) -> (bool, Option<PathBuf>) {
    let save_dir = match download_dir() {
        Some(dir) => dir,
        None => return (false, None)
    };

    let path = save_dir.join(filename);

    match download(download_url, path) {
        Ok(path) => {
            return (true, Some(path));
        } 
        Err(e) => {
            eprintln!("Download of {:?} to {:?} failed: {:?}", download_url, save_dir, e);
            return (false, None)
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, handle_download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
