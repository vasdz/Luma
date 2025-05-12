mod client;
mod rooms;
mod messages;
mod sync;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Serialize)]
struct LoginRequest<'a> {
    r#type: &'a str,
    identifier: UserIdentifier<'a>,
    password: &'a str,
    device_id: &'a str,
}

#[derive(Serialize)]
struct UserIdentifier<'a> {
    r#type: &'a str,
    user: &'a str,
}

#[derive(Deserialize)]
struct LoginResponse {
    access_token: String,
    home_server: String,
    user_id: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let client = client::create_client().await;

    // Авторизация первого пользователя
    let login_url = format!("{}/_matrix/client/r0/login", client::HOMESERVER);

    let request = LoginRequest {
        r#type: "m.login.password",
        identifier: UserIdentifier {
            r#type: "m.id.user",
            user: "@vasdz:localhost",
        },
        password: "vasdz_gg_net",
        device_id: "my_rust_client",
    };

    let res = client.post(&login_url).json(&request).send().await?;
    let body = res.text().await?;
    let login_data: LoginResponse = serde_json::from_str(&body)?;
    println!("Авторизация успешна: {}", login_data.user_id);

    // Создание комнаты
    let room_id = rooms::create_room(&client, &login_data.access_token).await?;
    println!("Комната создана: {}", room_id);

    // Авторизация второго пользователя
    let login_url = format!("{}/_matrix/client/r0/login", client::HOMESERVER);

    let request = LoginRequest {
        r#type: "m.login.password",
        identifier: UserIdentifier {
            r#type: "m.id.user",
            user: "@dasha:localhost",
        },
        password: "pass12",
        device_id: "dasha_device",
    };

    let res = client.post(&login_url).json(&request).send().await?;
    let body = res.text().await?;
    let alice_data: LoginResponse = serde_json::from_str(&body)?;
    println!("Авторизация успешна: {}", alice_data.user_id);

    // Присоединение второго пользователя к комнате
    rooms::join_room(&client, &alice_data.access_token, &room_id).await?;
    println!("Dasha присоединилась к комнате");

    messages::send_message(&client, &alice_data.access_token, &room_id, "Привет от Dasha!").await?;

    sync::listen_messages(&client, &login_data.access_token, &room_id).await?;

    Ok(())
}
