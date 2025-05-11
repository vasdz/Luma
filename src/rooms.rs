use crate::client::HOMESERVER;
use reqwest::Client;
use serde_json::Value;

pub async fn create_room(
    client: &Client,
    access_token: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let url = format!(
        "{}/_matrix/client/r0/createRoom?access_token={}",
        HOMESERVER, access_token
    );

    let res = client.post(&url).json(&serde_json::json!({})).send().await?;
    let json: Value = res.json().await?;

    let room_id = json["room_id"]
        .as_str()
        .ok_or("No room_id in response")?
        .to_string();

    Ok(room_id)
}

pub async fn join_room(
    client: &Client,
    access_token: &str,
    room_id: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let url = format!(
        "{}/_matrix/client/r0/rooms/{}/join?access_token={}",
        HOMESERVER, room_id, access_token
    );

    client.post(&url).send().await?;
    Ok(())
}
