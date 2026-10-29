use tauri::Emitter;
use tauri_plugin_shell::ShellExt;
use serde::{Deserialize, Serialize};
use std::time::Duration;

// ─── Shared types ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitChange {
    pub path: String,
    pub status: String,
    pub staged: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitStatusResult {
    pub branch: String,
    pub ahead: u32,
    pub behind: u32,
    pub changes: Vec<GitChange>,
}

/// Emitted for any long-running backend operation so the frontend
/// can show/hide a spinner without any JS setInterval.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProgressEvent {
    pub id: String,          // unique operation id
    pub kind: String,        // "start" | "tick" | "done" | "error"
    pub message: String,
    pub percent: Option<u8>, // 0-100, None = indeterminate
}

/// Emitted when a file on disk changes (future: file-watcher).
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileChangedEvent {
    pub path: String,
    pub kind: String,  // "modified" | "created" | "deleted"
}

// ─── Animation helpers ───────────────────────────────────────────────────────

/// Emit a progress sequence on a background thread.
/// This removes ALL JS timers from the frontend for long operations.
async fn emit_progress(
    app: &tauri::AppHandle,
    id: &str,
    message: &str,
) {
    // "start" — frontend shows spinner immediately
    let _ = app.emit("progress", ProgressEvent {
        id:      id.to_string(),
        kind:    "start".to_string(),
        message: message.to_string(),
        percent: None,
    });
}

async fn emit_done(
    app: &tauri::AppHandle,
    id: &str,
    message: &str,
) {
    let _ = app.emit("progress", ProgressEvent {
        id:      id.to_string(),
        kind:    "done".to_string(),
        message: message.to_string(),
        percent: Some(100),
    });
}

async fn emit_error(
    app: &tauri::AppHandle,
    id: &str,
    message: &str,
) {
    let _ = app.emit("progress", ProgressEvent {
        id:      id.to_string(),
        kind:    "error".to_string(),
        message: message.to_string(),
        percent: None,
    });
}

// ─── Git commands ────────────────────────────────────────────────────────────

#[tauri::command]
async fn git_status(app: tauri::AppHandle, cwd: String) -> Result<GitStatusResult, String> {
    emit_progress(&app, "git-status", "Reading git status…").await;
    let shell = app.shell();

    let branch_out = shell
        .command("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(&cwd)
        .output()
        .await
        .map_err(|e| e.to_string())?;
    let branch = String::from_utf8_lossy(&branch_out.stdout).trim().to_string();

    let (ahead, behind) = if !branch.is_empty() && branch != "HEAD" {
        let rev_out = shell
            .command("git")
            .args(["rev-list", "--left-right", "--count",
                   &format!("origin/{}...HEAD", branch)])
            .current_dir(&cwd)
            .output()
            .await;
        if let Ok(out) = rev_out {
            let s = String::from_utf8_lossy(&out.stdout);
            let parts: Vec<&str> = s.trim().split('\t').collect();
            let behind = parts.get(0).and_then(|v| v.parse::<u32>().ok()).unwrap_or(0);
            let ahead  = parts.get(1).and_then(|v| v.parse::<u32>().ok()).unwrap_or(0);
            (ahead, behind)
        } else { (0, 0) }
    } else { (0, 0) };

    let status_out = shell
        .command("git")
        .args(["status", "--porcelain", "-u"])
        .current_dir(&cwd)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let changes = String::from_utf8_lossy(&status_out.stdout)
        .lines()
        .filter(|l| l.len() >= 4)
        .map(|l| {
            let staged_char = l.chars().next().unwrap_or(' ');
            let tree_char   = l.chars().nth(1).unwrap_or(' ');
            let path        = l[3..].trim().to_string();
            let is_staged   = staged_char != ' ' && staged_char != '?';
            let status_char = if is_staged { staged_char } else { tree_char };
            GitChange {
                path,
                status: status_char.to_string(),
                staged: is_staged,
            }
        })
        .collect();

    let result = GitStatusResult { branch, ahead, behind, changes };
    emit_done(&app, "git-status", "Git status loaded").await;
    Ok(result)
}

#[tauri::command]
async fn git_diff(
    app: tauri::AppHandle,
    cwd: String,
    path: String,
    staged: bool,
) -> Result<String, String> {
    emit_progress(&app, "git-diff", "Loading diff…").await;
    let shell = app.shell();
    let mut args = vec!["diff", "--unified=3"];
    if staged { args.push("--cached"); }
    args.push("--");
    args.push(path.as_str());
    let out = shell
        .command("git").args(&args).current_dir(&cwd)
        .output().await.map_err(|e| e.to_string())?;
    emit_done(&app, "git-diff", "Diff loaded").await;
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}

#[tauri::command]
async fn git_stage(app: tauri::AppHandle, cwd: String, path: String) -> Result<(), String> {
    app.shell()
        .command("git").args(["add", "--", path.as_str()]).current_dir(&cwd)
        .output().await.map_err(|e| e.to_string())?;
    // Emit file-changed event so FilesPanel/StatusStrip can update
    let _ = app.emit("file-changed", FileChangedEvent {
        path:  path.clone(),
        kind:  "staged".to_string(),
    });
    Ok(())
}

#[tauri::command]
async fn git_unstage(app: tauri::AppHandle, cwd: String, path: String) -> Result<(), String> {
    app.shell()
        .command("git")
        .args(["restore", "--staged", "--", path.as_str()])
        .current_dir(&cwd)
        .output().await.map_err(|e| e.to_string())?;
    let _ = app.emit("file-changed", FileChangedEvent {
        path,
        kind: "unstaged".to_string(),
    });
    Ok(())
}

#[tauri::command]
async fn git_commit(
    app: tauri::AppHandle,
    cwd: String,
    message: String,
    amend: bool,
    sign_off: bool,
) -> Result<String, String> {
    emit_progress(&app, "git-commit", "Committing…").await;
    let mut args = vec!["commit".to_string(), "-m".to_string(), message];
    if amend    { args.push("--amend".to_string()); }
    if sign_off { args.push("-s".to_string()); }
    let out = app.shell()
        .command("git").args(&args).current_dir(&cwd)
        .output().await.map_err(|e| e.to_string())?;
    let stdout = String::from_utf8_lossy(&out.stdout).to_string();
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    if out.status.success() {
        emit_done(&app, "git-commit", "Committed").await;
        Ok(stdout)
    } else {
        emit_error(&app, "git-commit", &stderr).await;
        Err(stderr)
    }
}

#[tauri::command]
async fn git_push(app: tauri::AppHandle, cwd: String) -> Result<String, String> {
    emit_progress(&app, "git-push", "Pushing to remote…").await;

    // Emit ticks every 300ms so the frontend progress bar animates
    // entirely from Rust — no JS timers at all.
    let app2  = app.clone();
    let cwd2  = cwd.clone();
    let handle = tauri::async_runtime::spawn(async move {
        app2.shell()
            .command("git").args(["push"]).current_dir(&cwd2)
            .output().await
    });

    // Tick the progress bar from Rust while push is running
    let tick_app = app.clone();
    let tick_handle = tauri::async_runtime::spawn(async move {
        let percents = [15u8, 30, 50, 70, 85];
        for &p in &percents {
            tokio::time::sleep(Duration::from_millis(300)).await;
            let _ = tick_app.emit("progress", ProgressEvent {
                id:      "git-push".to_string(),
                kind:    "tick".to_string(),
                message: "Pushing…".to_string(),
                percent: Some(p),
            });
        }
    });

    let out    = handle.await.map_err(|e| e.to_string())?
                             .map_err(|e| e.to_string())?;
    tick_handle.abort();

    let stdout = String::from_utf8_lossy(&out.stdout).to_string();
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();

    if out.status.success() {
        emit_done(&app, "git-push", "Push complete").await;
        Ok(stdout)
    } else {
        emit_error(&app, "git-push", &stderr).await;
        Err(stderr)
    }
}

#[tauri::command]
async fn git_pull(app: tauri::AppHandle, cwd: String) -> Result<String, String> {
    emit_progress(&app, "git-pull", "Pulling from remote…").await;

    let app2 = app.clone();
    let cwd2 = cwd.clone();
    let handle = tauri::async_runtime::spawn(async move {
        app2.shell()
            .command("git").args(["pull"]).current_dir(&cwd2)
            .output().await
    });

    let tick_app = app.clone();
    let tick_handle = tauri::async_runtime::spawn(async move {
        for &p in &[20u8, 50, 80] {
            tokio::time::sleep(Duration::from_millis(250)).await;
            let _ = tick_app.emit("progress", ProgressEvent {
                id:      "git-pull".to_string(),
                kind:    "tick".to_string(),
                message: "Pulling…".to_string(),
                percent: Some(p),
            });
        }
    });

    let out = handle.await.map_err(|e| e.to_string())?
                          .map_err(|e| e.to_string())?;
    tick_handle.abort();

    let stdout = String::from_utf8_lossy(&out.stdout).to_string();
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();

    if out.status.success() {
        emit_done(&app, "git-pull", "Pull complete").await;
        Ok(stdout)
    } else {
        emit_error(&app, "git-pull", &stderr).await;
        Err(stderr)
    }
}

#[tauri::command]
async fn git_discard(app: tauri::AppHandle, cwd: String, path: String) -> Result<(), String> {
    app.shell()
        .command("git")
        .args(["checkout", "--", path.as_str()])
        .current_dir(&cwd)
        .output().await.map_err(|e| e.to_string())?;
    let _ = app.emit("file-changed", FileChangedEvent {
        path,
        kind: "discarded".to_string(),
    });
    Ok(())
}

// ─── Window animation commands ───────────────────────────────────────────────

/// Ask Rust to schedule the window open animation.
/// Uses Tauri's native async without any JS setTimeout.
#[tauri::command]
async fn window_ready(app: tauri::AppHandle) {
    // Brief delay then emit "window-fade-in" — frontend CSS handles the
    // actual visual (opacity transition driven by a class toggle),
    // but the *timing* is controlled entirely here in Rust.
    tokio::time::sleep(Duration::from_millis(60)).await;
    let _ = app.emit("window-fade-in", ());
}

/// Emitted by Rust on a tick to drive the status-bar "syncing" pulse.
/// Frontend only reads the event and toggles a CSS class — no JS interval.
#[tauri::command]
async fn start_sync_pulse(app: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        for _ in 0..8 {
            tokio::time::sleep(Duration::from_millis(150)).await;
            let _ = app.emit("sync-pulse", ());
        }
        let _ = app.emit("sync-pulse-done", ());
    });
}

// ─── Entry point ─────────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            git_status,
            git_diff,
            git_stage,
            git_unstage,
            git_commit,
            git_push,
            git_pull,
            git_discard,
            window_ready,
            start_sync_pulse,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

