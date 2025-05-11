use reqwest::Client;

pub async fn create_client() -> Client {
    Client::new()
}

pub const HOMESERVER: &str = "http://localhost:8008";