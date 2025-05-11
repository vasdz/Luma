use crate::client::HOMESERVER;
use reqwest::Client;
use serde_json::Value;

pub async fn listen_messages(
    client: &Client,
    access_token: &str,
    room_id: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let sync_url = format!("{}/_matrix/client/r0/sync", HOMESERVER);
    let mut since: Option<String> = None;

    loop {
        let mut url = reqwest::Url::parse(&sync_url)?;

        // Создаем базовый набор параметров
        let mut query = vec![
            ("access_token", access_token),
            ("timeout", "30000"),
        ];

        // Добавляем параметр since, если он есть
        if let Some(s) = &since {
            query.push(("since", s.as_str()));
        }

        url.query_pairs_mut().extend_pairs(query.into_iter());

        let res = client.get(url).send().await?;
        let json: Value = res.json().await?;

        if let Some(next_batch) = json["next_batch"].as_str() {
            since = Some(next_batch.to_string());
        }

        if let Some(room_data) = json["rooms"]["join"].get(room_id) {
            if let Some(events) = room_data["timeline"]["events"].as_array() {
                for event in events {
                    if event["type"] == "m.room.message" && event["content"]["msgtype"] == "m.text" {
                        let sender = event["sender"].as_str().unwrap_or("?");
                        let body = event["content"]["body"].as_str().unwrap_or("");
                        println!("[{}] {}: {}", room_id, sender, body);
                    }
                }
            }
        }
    }
}