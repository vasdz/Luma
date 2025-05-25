use std::error::Error;
use reqwest::Client;
use serde_json::Value;
use crate::client::HOMESERVER;

pub async fn create_room(
    name: &str,
    preset: &str,
    access_token: &str,
) -> Result<String, Box<dyn Error>> {
    let url = format!(
        "{}/_matrix/client/v3/createRoom?access_token={}",
        HOMESERVER, access_token
    );
    let body = serde_json::json!({
        "name": name,
        "preset": preset
    });
    let client = Client::new();
    let res = client.post(&url).json(&body).send().await?;
    let json = res.json::<Value>().await?;
    json.get("room_id")
        .and_then(Value::as_str)
        .map(String::from)
        .ok_or_else(|| "No room_id in response".into())
}

// Новая функция выхода из комнаты
pub async fn leave_room(
    room_id: &str,
    access_token: &str,
) -> Result<(), Box<dyn Error>> {
    let url = format!(
        "{}/_matrix/client/v3/rooms/{}/leave?access_token={}",
        HOMESERVER, room_id, access_token
    );
    let client = Client::new();
    let res = client.post(&url).send().await?;
    if res.status().is_success() {
        Ok(())
    } else {
        let text = res.text().await.unwrap_or_default();
        Err(format!("Failed to leave room: {}", text).into())
    }
}

