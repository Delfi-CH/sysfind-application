use futures_util::StreamExt;
use reqwest::Client;
use serde::Serialize;
use std::{collections::HashMap, path::PathBuf};
use tauri::ipc::Channel;
use tokio::{fs::File, io::AsyncWriteExt, sync::Mutex};
use std::sync::Arc;
use tokio::sync::oneshot;

#[derive(Clone)]
pub struct DownloadManager {
    cancels: Arc<Mutex<HashMap<String, oneshot::Sender<()>>>>,
}

impl DownloadManager {
    pub fn new() -> Self {
        Self {
            cancels: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn cancel(&self, id: String) {
        if let Some(tx) = self.cancels.lock().await.remove(&id) {
            let _ = tx.send(());
        }
    }

    pub async fn download(
        &self,
        id: String,
        url: String,
        dest: PathBuf,
        progress: Channel<DownloadEvent>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let client = Client::new();
        let res = client.get(&url).send().await?;

        let total = res.content_length().unwrap_or(0);

        progress.send(DownloadEvent::Started {
            id: id.clone(),
            total,
        })?;

        let mut file = File::create(dest).await?;
        let mut stream = res.bytes_stream();

        let mut downloaded: u64 = 0;

        let (cancel_tx, mut cancel_rx) = oneshot::channel();
        self.cancels.lock().await.insert(id.clone(), cancel_tx);

        loop {
            tokio::select! {

                _ = &mut cancel_rx => {
                    progress.send(DownloadEvent::Cancelled { id: id.clone() })?;
                    break;
                }

                chunk = stream.next() => {
                    let chunk = match chunk {
                        Some(c) => c?,
                        None => break,
                    };

                    file.write_all(&chunk).await?;
                    downloaded += chunk.len() as u64;

                    progress.send(DownloadEvent::Progress {
                        id: id.clone(),
                        downloaded,
                        total,
                    })?;
                }
            }
        }

        progress.send(DownloadEvent::Finished { id })?;
        Ok(())
    }
}

#[derive(Serialize, Clone)]
#[serde(tag = "event", content = "data")]
pub enum DownloadEvent {
    Started { id: String, total: u64 },
    Progress { id: String, downloaded: u64, total: u64 },
    Finished { id: String },
    Cancelled { id: String },
}