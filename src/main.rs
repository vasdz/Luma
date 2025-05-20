use axum::{
    extract::Json,
    http::{StatusCode, Uri},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Any};
use serde_json::Value;

mod client;
mod matrix_api;
mod rooms;
mod sync;

#[derive(Deserialize)]
struct AuthPayload {
    username: String,
    password: String,
}

#[derive(Serialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Serialize)]
struct RoomsResponse {
    rooms: Vec<String>,
}

#[tokio::main]
async fn main() {
    // CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/register", post(register_handler))
        .route("/api/login", post(login_handler))
        .route("/api/rooms", get(get_rooms_handler))
        .route("/api/rooms/:room_id/messages", get(get_messages_handler))
        .route("/api/rooms/:room_id/send", post(send_message_handler))
        .route("/api/createRoom", post(create_room_handler))
        .layer(cors);

    let addr = "0.0.0.0:3000".parse().unwrap();
    println!("🚀 Сервер запущен на http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

// --- Регистрация ---
async fn register_handler(
    Json(payload): Json<AuthPayload>,
) -> Result<Json<TokenResponse>, (StatusCode, String)> {
    match matrix_api::matrix_register(&payload.username, &payload.password).await {
        Ok(token) => Ok(Json(TokenResponse {
            access_token: token,
        })),
        Err(e) => {
            let err_str = e.to_string();
            if err_str.contains("M_USER_IN_USE") || err_str.contains("duplicate") {
                Err((StatusCode::CONFLICT, "Пользователь уже существует".into()))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, format!("Ошибка регистрации: {}", err_str)))
            }
        }
    }
}

// --- Вход ---
async fn login_handler(
    Json(payload): Json<AuthPayload>,
) -> Result<Json<TokenResponse>, (StatusCode, String)> {
    match matrix_api::matrix_login(&payload.username, &payload.password).await {
        Ok(token) => Ok(Json(TokenResponse {
            access_token: token,
        })),
        Err(e) => {
            let err_str = e.to_string();
            if err_str.contains("M_FORBIDDEN") || err_str.contains("unauthorized") {
                Err((StatusCode::UNAUTHORIZED, "Неверные имя пользователя или пароль".into()))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, format!("Ошибка входа: {}", err_str)))
            }
        }
    }
}

// --- Получение комнат ---
async fn get_rooms_handler(uri: Uri) -> Result<Json<RoomsResponse>, (StatusCode, String)> {
    let token = extract_token(&uri)?;
    match matrix_api::get_rooms(&token).await {
        Ok(rooms) => Ok(Json(RoomsResponse { rooms })),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// --- Получение сообщений ---
async fn get_messages_handler(
    uri: Uri,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let (room_id, token) = parse_room_and_token(&uri)?;
    match matrix_api::get_messages(&room_id, &token).await {
        Ok(messages) => Ok(Json(serde_json::json!({ "messages": messages }))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// --- Отправка сообщений ---
async fn send_message_handler(
    uri: Uri,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let (room_id, token) = parse_room_and_token(&uri)?;
    let message = payload.get("message")
        .and_then(|m| m.as_str())
        .ok_or((StatusCode::BAD_REQUEST, "Сообщение не указано".to_string()))?;

    match matrix_api::send_message(&room_id, &token, message).await {
        Ok(_) => Ok(StatusCode::OK),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

/// --- Создание новой комнаты ---
async fn create_room_handler(
    uri: Uri,
    Json(body): Json<Value>, // JSON из запроса { name, preset }
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // 1) забираем токен из query
    let token = extract_token(&uri)?;
    // 2) получаем поля или ставим дефолт
    let name = body.get("name").and_then(Value::as_str).unwrap_or("Новая комната");
    let preset = body.get("preset").and_then(Value::as_str).unwrap_or("private_chat");
    // 3) вызываем matrix_api
    match matrix_api::create_room(name, preset, &token).await {
        Ok(room_id) => {
            let resp = serde_json::json!({ "room_id": room_id });
            Ok((StatusCode::CREATED, Json(resp)))
        }
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// --- Вспомогательные функции ---
fn extract_token(uri: &Uri) -> Result<String, (StatusCode, String)> {
    let query = uri.query().ok_or((StatusCode::UNAUTHORIZED, "Токен не предоставлен".to_string()))?;
    let token = query
        .split('&')
        .find(|p| p.starts_with("access_token="))
        .and_then(|p| p.split('=').nth(1))
        .map(String::from)
        .ok_or((StatusCode::UNAUTHORIZED, "Токен не предоставлен".to_string()))?;
    Ok(token)
}

fn parse_room_and_token(uri: &Uri) -> Result<(String, String), (StatusCode, String)> {
    let path = uri.path();
    let room_id = path.split('/').nth(4).ok_or((StatusCode::BAD_REQUEST, "Неверный ID комнаты".to_string()))?;
    let query = uri.query().ok_or((StatusCode::UNAUTHORIZED, "Токен не предоставлен".to_string()))?;
    let token = query.split('&')
        .find(|p| p.starts_with("access_token="))
        .and_then(|p| p.split('=').nth(1))
        .map(|s| s.to_string())
        .ok_or((StatusCode::UNAUTHORIZED, "Токен не предоставлен".to_string()))?;
    Ok((room_id.to_string(), token))
}