use reqwest::Client;
use std::error::Error;
use serde_json::Value;

const HOMESERVER: &str = "http://localhost:8008";

pub async fn matrix_register(username: &str, password: &str) -> Result<String, Box<dyn Error>> {
    let client = Client::new();
    let url = format!("{}/_matrix/client/v3/register", HOMESERVER);
    let body = serde_json::json!({
        "username": username,
        "password": password,
        "auth": { "type": "m.login.dummy" }
    });
    let res = client.post(&url).json(&body).send().await?;
    let json = res.json::<Value>().await?;
    if let Some(errcode) = json.get("errcode") {
        return Err(format!("Matrix error: {}", errcode).into());
    }
    json.get("access_token")
        .and_then(|t| t.as_str())
        .map(String::from)
        .ok_or_else(|| "No access_token in response".into())
}

pub async fn matrix_login(username: &str, password: &str) -> Result<String, Box<dyn Error>> {
    let client = Client::new();
    let url = format!("{}/_matrix/client/v3/login", HOMESERVER);
    let body = serde_json::json!({
        "type": "m.login.password",
        "identifier": { "type": "m.id.user", "user": username },
        "password": password,
        "device_id": "RustClient"
    });
    let res = client.post(&url).json(&body).send().await?;
    let json = res.json::<Value>().await?;
    if let Some(errcode) = json.get("errcode") {
        return Err(format!("Matrix error: {}", errcode).into());
    }
    json.get("access_token")
        .and_then(|t| t.as_str())
        .map(String::from)
        .ok_or_else(|| "No access_token in response".into())
}

pub async fn create_room(
    name: &str,
    preset: &str,
    access_token: &str,
) -> Result<String, Box<dyn Error>> {
    let client = Client::new();
    let url = format!(
        "{}/_matrix/client/v3/createRoom?access_token={}",
        HOMESERVER, access_token
    );
    let body = serde_json::json!({
        "name": name,
        "preset": preset
    });
    let res = client.post(&url).json(&body).send().await?;
    let json = res.json::<Value>().await?;
    json.get("room_id")
        .and_then(Value::as_str)
        .map(String::from)
        .ok_or_else(|| "No room_id in response".into())
}

// --- Получение комнат ---
pub async fn get_rooms(access_token: &str) -> Result<Vec<String>, Box<dyn Error>> {
    let client = Client::new();
    let url = format!("{}/_matrix/client/r0/sync?access_token={}", HOMESERVER, access_token);
    let res = client.get(&url).send().await?;
    let json = res.json::<Value>().await?;
    let rooms = json["rooms"]["join"]
        .as_object()
        .map(|obj| obj.keys().cloned().collect())
        .unwrap_or_default();
    Ok(rooms)
}

// --- Получение сообщений ---
pub async fn get_messages(room_id: &str, access_token: &str) -> Result<Vec<Value>, Box<dyn Error>> {
    let client = Client::new();
    let url = format!("{}/_matrix/client/r0/rooms/{}/messages?access_token={}&limit=50", HOMESERVER, room_id, access_token);
    let res = client.get(&url).send().await?;
    let json = res.json::<Value>().await?;
    let messages = json.get("chunk")
        .and_then(|c| c.as_array())
        .cloned()
        .unwrap_or_default();
    Ok(messages)
}

// --- Отправка сообщений ---
pub async fn send_message(room_id: &str, access_token: &str, message: &str) -> Result<(), Box<dyn Error>> {
    let client = Client::new();
    let event_id = uuid::Uuid::new_v4();
    let url = format!(
        "{}/_matrix/client/r0/rooms/{}/send/m.room.message/{}?access_token={}",
        HOMESERVER, room_id, event_id, access_token
    );
    let content = serde_json::json!({
        "msgtype": "m.text",
        "body": message
    });
    let res = client.put(&url).json(&content).send().await?;
    if !res.status().is_success() {
        return Err(format!("Failed to send message: {}", res.status()).into());
    }
    Ok(())
}