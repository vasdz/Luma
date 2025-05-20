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
