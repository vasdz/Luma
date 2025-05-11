use crate::client::HOMESERVER;
use reqwest::Client;
use uuid::Uuid;

pub async fn send_message(
    client: &Client,
    access_token: &str,
    room_id: &str,
    message: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let event_id = Uuid::new_v4(); // Уникальный ID события
    let url = format!(
        "{}/_matrix/client/r0/rooms/{}/send/m.room.message/{}?access_token={}",
        HOMESERVER, room_id, event_id, access_token
    );

    let content = serde_json::json!({
        "msgtype": "m.text",
        "body": message,
    });

    client.put(&url).json(&content).send().await?;
    println!("Сообщение отправлено: {}", message);
    Ok(())
}