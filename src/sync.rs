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
        let mut params: Vec<(&str, &str)> = vec![
            ("access_token", access_token),
            ("timeout", "30000"),
        ];
        if let Some(ref s) = since {
            params.push(("since", s.as_str()));
        }
        url.query_pairs_mut().extend_pairs(params);

        let res = client.get(url).send().await?;
        let json = res.json::<Value>().await?;
        since = json.get("next_batch").and_then(|v| v.as_str()).map(String::from);

        if let Some(events) = json["rooms"]["join"][room_id]["timeline"]["events"].as_array() {
            for ev in events {
                if ev["type"] == "m.room.message" {
                    let sender = ev["sender"].as_str().unwrap_or("?");
                    let body = ev["content"]["body"].as_str().unwrap_or("");
                    println!("{}: {}", sender, body);
                }
            }
        }
    }
}
