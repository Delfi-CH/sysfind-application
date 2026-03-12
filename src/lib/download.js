// @ts-nocheck
import { invoke, Channel } from "@tauri-apps/api/core";

export class DownloadManager {
  constructor() {
    this.downloads = {};
  }

  start(url, savePath, hash, callbacks = {}) {
    const id = crypto.randomUUID();
    const channel = new Channel();

    channel.onmessage = (msg) => {
      switch (msg.event) {
        case "Progress":
          callbacks.onProgress && callbacks.onProgress(msg.data);
          break;
        case "Finished":
          callbacks.onFinished && callbacks.onFinished(msg.data);
          break;
        case "Cancelled":
          callbacks.onCancelled && callbacks.onCancelled(msg.data);
          break;
        case "HashMismatch":
          callbacks.onHashMismatch && callbacks.onHashMismatch(msg.data)
          break;
      }
    };

    this.downloads[id] = channel;

    invoke("start_download", {
      id,
      url,
      path: savePath,
      hash,
      onEvent: channel,
    });

    return id;
  }

  cancel(id) {
    if (this.downloads[id]) {
      invoke("cancel_download", { id });
      delete this.downloads[id];
    }
  }
}