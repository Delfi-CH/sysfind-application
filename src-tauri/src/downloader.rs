use futures_util::StreamExt;
use reqwest::Client;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::sync::Arc;
use std::{collections::HashMap, path::PathBuf};
use tauri::ipc::Channel;
use tokio::sync::oneshot;
use tokio::{fs::File, io::AsyncWriteExt, sync::Mutex};

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
        expected_hash: String,
        progress: Channel<DownloadEvent>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let client = Client::new();
        let mut hasher = Sha256::new();
        let res = client.get(&url).send().await?;

        let total = res.content_length().unwrap_or(0);
        let mut cancelled = false;

        progress.send(DownloadEvent::Started {
            id: id.clone(),
            total,
        })?;

        let mut file = File::create(&dest).await?;
        let mut stream = res.bytes_stream();

        let mut downloaded: u64 = 0;

        let (cancel_tx, mut cancel_rx) = oneshot::channel();
        self.cancels.lock().await.insert(id.clone(), cancel_tx);

        loop {
            tokio::select! {

                _ = &mut cancel_rx => {
                    cancelled = true;
                    progress.send(DownloadEvent::Cancelled { id: id.clone() })?;
                    break;
                }

                chunk = stream.next() => {
                    let chunk = match chunk {
                        Some(c) => c?,
                        None => break,
                    };

                    file.write_all(&chunk).await?;
                    hasher.update(&chunk);
                    downloaded += chunk.len() as u64;

                    progress.send(DownloadEvent::Progress {
                        id: id.clone(),
                        downloaded,
                        total,
                    })?;
                }
            }
        }

        if cancelled {
            drop(file);
            let _ = tokio::fs::remove_file(&dest).await;
            return Ok(());
        }

        let result = hasher.finalize();
        let hash = hex::encode(result);

        if hash != expected_hash {
            progress.send(DownloadEvent::HashMismatch {
                id: id.clone(),
                expected: expected_hash,
                actual: hash,
            })?;
            drop(file);
            let _ = tokio::fs::remove_file(&dest).await;
            return Ok(());
        }

        progress.send(DownloadEvent::Finished { id })?;
        Ok(())
    }
}

#[derive(Serialize, Clone)]
#[serde(tag = "event", content = "data")]
pub enum DownloadEvent {
    Started {
        id: String,
        total: u64,
    },
    Progress {
        id: String,
        downloaded: u64,
        total: u64,
    },
    Finished {
        id: String,
    },
    Cancelled {
        id: String,
    },
    HashMismatch {
        id: String,
        expected: String,
        actual: String,
    },
}
