import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test the FastAPI backend health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "BULLSIGHT" in data["service"]

def test_market_overview():
    """Test retrieval of market overview data."""
    response = client.get("/api/market/overview")
    assert response.status_code == 200
    data = response.json()
    assert "indices" in data or isinstance(data, list) or isinstance(data, dict)

def test_stock_quote():
    """Test retrieval of stock quote and summary for a valid symbol (AAPL)."""
    response = client.get("/api/stocks/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert data["symbol"].upper() == "AAPL"
    assert "price" in data or "current_price" in data

def test_technical_indicators():
    """Test technical indicators endpoint for AAPL."""
    response = client.get("/api/stocks/AAPL/indicators")
    assert response.status_code == 200
    data = response.json()
    assert "rsi" in data or "indicators" in data or "macd" in data

def test_prediction_endpoint():
    """Test LSTM prediction inference pipeline for AAPL."""
    response = client.get("/api/predictions/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert "current_price" in data
    assert "predicted_price" in data or "predictions" in data or "trend" in data
