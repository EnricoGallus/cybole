#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

fn main() {
    sentry_tauri::init(
        sentry::release_name!(),
        |_| {
            sentry::init((
                "https://639261e8fe5846fa8d3a4e78131d5f64@o367548.ingest.sentry.io/6425628",
                sentry::ClientOptions {
                    release: sentry::release_name!(),
                    ..Default::default()
                },
            ))
        },
        |sentry_plugin| {
            let context = tauri::generate_context!();
            use tauri::Manager;
            tauri::Builder::default()
                .setup(|app| {
                    #[cfg(debug_assertions)] // only include this code on debug builds
                    {
                        let window = app.get_window("main").unwrap();
                        window.open_devtools();
                        window.close_devtools();
                    }
                    Ok(())
                })
                .menu(if cfg!(target_os = "macos") {
                    tauri::Menu::os_default(&context.package_info().name)
                } else {
                    tauri::Menu::default()
                })
                .plugin(sentry_plugin)
                .run(context)
                .expect("error while running tauri application");
        },
    );
}
