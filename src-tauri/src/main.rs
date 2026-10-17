#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_fs::FsExt;

// Previously selected projects predate persisted-scope. Restore their access from
// the unchanged settings file so the recent-project list still works after upgrading.
fn restore_project_scopes(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let path = app.path().app_config_dir()?.join("settings.json");
    let content = match std::fs::read_to_string(path) {
        Ok(content) => content,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(error) => return Err(error.into()),
    };
    let settings: serde_json::Value = serde_json::from_str(&content)?;
    if let Some(projects) = settings.get("projects").and_then(|value| value.as_array()) {
        for project in projects {
            if let Some(path) = project.get("path").and_then(|value| value.as_str()) {
                if std::path::Path::new(path).is_dir() {
                    app.fs_scope().allow_directory(path, true)?;
                }
            }
        }
    }
    Ok(())
}

fn main() {
    let sentry_plugin = tauri_plugin_sentry::Sentry::new();
    let options = sentry::ClientOptions::new()
        .add_integration(sentry_plugin.clone())
        .dsn("https://639261e8fe5846fa8d3a4e78131d5f64@o367548.ingest.sentry.io/6425628")
        .maybe_release(sentry::release_name!());
    let _sentry = sentry::init(options);

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(sentry_plugin)
        .setup(|app| {
            // Storage errors are also reported by the frontend; never replace the
            // existing settings with defaults just to restore a filesystem scope.
            if let Err(error) = restore_project_scopes(app) {
                eprintln!("Could not restore project access: {error}");
            }
            #[cfg(target_os = "macos")]
            app.set_menu(tauri::menu::Menu::default(app.handle())?)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
