#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use keyring::{Entry};
use serde::ser::{Serialize};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![vault_save, vault_read, vault_delete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Debug, thiserror::Error)]
enum CustomError {
    #[error("Keyring error: {0}")]
    KeyringError(#[from] keyring::Error)
}

impl Serialize for CustomError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
fn vault_save(service: String, account: String, value: String) -> Result<(), CustomError> {
    let entry = Entry::new(&service, &account)?;
    entry.set_password(&value)?;
    Ok(())
}

#[tauri::command]
fn vault_read(service: String, account: String) -> Result<String, CustomError> {
    let entry = Entry::new(&service, &account)?;
    let password = entry.get_password()?;
    Ok(password)
}


#[tauri::command]
fn vault_delete(service: String, account: String) -> Result<(), CustomError> {
    let entry = Entry::new(&service, &account)?;
    entry.delete_password()?;
    Ok(())
}