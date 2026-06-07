#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;

fn get_data_path() -> PathBuf {
    let mut path = dirs_next::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("rasgovorilka");
    fs::create_dir_all(&path).ok();
    path.push("data.json");
    path
}

#[tauri::command]
fn save_data(data: String) -> Result<(), String> {
    let path = get_data_path();
    fs::write(&path, &data).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_data() -> Result<String, String> {
    let path = get_data_path();
    if path.exists() {
        fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        Ok("{}".to_string())
    }
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
fn set_fullscreen(window: tauri::Window, fullscreen: bool) {
    window.set_fullscreen(fullscreen).ok();
}

#[tauri::command]
fn export_data(data: String) -> Result<String, String> {
    let download_dir = dirs_next::download_dir().unwrap_or_else(|| PathBuf::from("."));
    let file_path = download_dir.join("rasgovorilka_backup.json");
    fs::write(&file_path, &data).map_err(|e| e.to_string())?;
    Ok(file_path.to_string_lossy().to_string())
}

// Нативная озвучка через spd-say (только для desktop)
#[cfg(not(target_os = "android"))]
#[tauri::command]
fn speak_native(text: String) -> Result<(), String> {
    std::process::Command::new("spd-say")
        .arg("-w")           // ждать окончания воспроизведения
        .arg("-l")
        .arg("ru")
        .arg(&text)
        .output()
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(not(target_os = "android"))]
    {
        builder = builder.invoke_handler(
            tauri::generate_handler![
                save_data, load_data, set_fullscreen, export_data, speak_native
            ]
        );
    }
    #[cfg(target_os = "android")]
    {
        builder = builder.invoke_handler(
            tauri::generate_handler![save_data, load_data, export_data]
        );
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Точка входа для Android (без аргументов)
#[cfg(target_os = "android")]
#[tauri::mobile_entry_point]
fn main_mobile() {
    run();
}
