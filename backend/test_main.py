import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import models, schemas

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["offline_mode_ready"] is True

def test_get_foods():
    response = client.get("/foods")
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) >= 10
    names = [f["name"] for f in foods]
    assert "Idli with sambar" in names
    assert "Masala dosa" in names

def test_analyze_food_demo():
    response = client.post("/analyze-food", json={"demo_food_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "food_name" in data
    assert data["sensory_profile"]["texture"] == "Soft"
    assert "confidence" in data

def test_sensory_profile_and_recommend():
    # Save a profile preferring soft & low spice
    profile_payload = {
        "user_id": 1,
        "texture": "Soft",
        "taste": "Mild",
        "spice": "Mild",
        "smell": "Low",
        "temperature": "Warm",
        "food_arrangement": "Separate",
        "predictability": "Familiar foods preferred",
        "preferences": {
            "texture": "Preferred",
            "spice": "Avoid",
            "smell": "Avoid"
        }
    }
    res_prof = client.post("/sensory-profile", json=profile_payload)
    assert res_prof.status_code == 200

    # Get recommendations
    rec_res = client.post("/recommend", json={"user_id": 1})
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    
    assert "best_matches" in rec_data
    assert len(rec_data["best_matches"]) > 0
    # Top match should be soft, low spice like Idli or Paneer curry
    top_food = rec_data["best_matches"][0]["food_name"]
    assert top_food in ["Idli with sambar", "Paneer curry with rice", "Penne pasta with cream", "Soft veg sandwich"]

def test_feedback_learning_loop():
    feedback_payload = {
        "user_id": 1,
        "food_id": 2, # Masala dosa (crispy/spicy)
        "rating": "didnt_work",
        "tags": ["Too spicy", "Too crunchy"],
        "comments": "Too crunchy and spicy for my sensory preferences."
    }
    response = client.post("/feedback", json=feedback_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "personalized" in data["updated_weights_notice"].lower()

def test_cafeteria_metrics_and_insights():
    res_metrics = client.get("/cafeteria/metrics")
    assert res_metrics.status_code == 200
    metrics = res_metrics.json()
    assert metrics["total_analyzed"] > 0
    assert metrics["acceptance_rate"] > 0

    res_insights = client.get("/cafeteria/insights")
    assert res_insights.status_code == 200
    insights = res_insights.json()
    assert len(insights["most_accepted_traits"]) > 0
    assert insights["simulated_waste_reduction_percent"] > 0
