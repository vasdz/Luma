use crate::client::HOMESERVER;
use reqwest::Client;
use serde_json::Value;

pub async fn create_room(
    client: &Client,
    access_token: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let url = format!("{}/_matrix/client/r0/createRoom?access_token={}", HOMESERVER, access_token);
    let res = client.post(&url).send().await?;
    let json = res.json::<Value>().await?;
    json.get("room_id")
        .and_then(|v| v.as_str())
        .map(String::from)
        .ok_or_else(|| "No room_id in response".into())
}

pub async fn join_room(
    client: &Client,
    access_token: &str,
    room_id: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let url = format!("{}/_matrix/client/r0/rooms/{}/join?access_token={}", HOMESERVER, room_id, access_token);
    let res = client.post(&url).send().await?;
    if !res.status().is_success() {
        return Err(format!("Failed to join room: {}", res.status()).into());
    }
    Ok(())
}
