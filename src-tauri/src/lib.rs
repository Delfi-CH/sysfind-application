mod downloader;

use downloader::{DownloadEvent, DownloadManager};
use std::path::PathBuf;
use tokio::fs;
use tokio::io::AsyncReadExt;
use futures::future::try_join_all;
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

#[tauri::command]
async fn read_files(dir: String) -> Result<Vec<String>, String> {
    let dir_path = PathBuf::from(dir);

    if !dir_path.is_dir() {
        return Err("Provided path is not a directory".into());
    }

    let mut dir_entries = fs::read_dir(&dir_path)
        .await
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut paths = Vec::new();
    while let Some(entry) = dir_entries
        .next_entry()
        .await
        .map_err(|e| format!("Failed to read directory entry: {}", e))?
    {
        let path = entry.path();
        if path.is_file() {
            paths.push(path);
        }
    }

    let read_futures = paths.into_iter().map(|path| async move {
        let mut file = fs::File::open(&path).await?;
        let mut data = String::new();
        file.read_to_string(&mut data).await?;
        Ok::<_, std::io::Error>(data)
    });

    try_join_all(read_futures)
        .await
        .map_err(|e| format!("Failed to read files: {}", e))
}

pub fn init() -> DownloadManager {
    DownloadManager::new()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manager = init();

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(manager)
        .invoke_handler(tauri::generate_handler![
            greet,
            start_download,
            cancel_download,
            read_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
