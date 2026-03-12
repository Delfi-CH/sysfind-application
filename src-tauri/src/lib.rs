mod downloader;

use downloader::{DownloadEvent, DownloadManager};
use std::path::PathBuf;
use tauri::{ipc::Channel, State};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_download(
    manager: State<'_, DownloadManager>,
    id: String,
    url: String,
    path: String,
    hash: String,
    on_event: Channel<DownloadEvent>,
) -> Result<(), String> {
    manager
        .download(id, url, PathBuf::from(path), hash, on_event)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cancel_download(manager: State<'_, DownloadManager>, id: String) -> Result<(), String> {
    manager.cancel(id).await;
    Ok(())
}

pub fn init() -> DownloadManager {
    DownloadManager::new()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manager = init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(manager)
        .invoke_handler(tauri::generate_handler![
            greet,
            start_download,
            cancel_download,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
