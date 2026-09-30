import json
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict

import models
import schemas
from database import engine, Base, get_db
from seed import seed_db
from sensory_engine import update_user_weights_from_feedback, compute_sensory_load, compute_sensory_compatibility
from food_analyzer import analyze_food_input, apply_uncertainty_correction
from recommendation import generate_recommendations, get_or_create_default_profile
import adaptation

# Ensure DB schema exists and is seeded on startup
Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI(
    title="SENSEPLATE API",
    description="Sensory-aware food accessibility & cafeteria waste reduction engine.",
    version="1.0.0"
)

# Enable CORS for localhost frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "SENSEPLATE Backend Engine",
        "offline_mode_ready": True
    }

@app.post("/users", response_model=schemas.UserResponse, tags=["Users"])
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = models.User(username=user_in.username)
    db.add(user)
    db.commit()
    db.refresh(user)
    # Also initialize default sensory profile
    get_or_create_default_profile(db, user.id)
    return user

@app.get("/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/sensory-profile", response_model=schemas.SensoryProfileResponse, tags=["Sensory Profile"])
def save_sensory_profile(profile_in: schemas.SensoryProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(models.SensoryProfile).filter(models.SensoryProfile.user_id == profile_in.user_id).first()
    if not profile:
        profile = models.SensoryProfile(user_id=profile_in.user_id)
        db.add(profile)

    profile.texture = profile_in.texture
    profile.taste = profile_in.taste
    profile.spice = profile_in.spice
    profile.smell = profile_in.smell
    profile.temperature = profile_in.temperature
    profile.food_arrangement = profile_in.food_arrangement
    profile.predictability = profile_in.predictability
    profile.preferences_json = json.dumps(profile_in.preferences)
    if profile_in.weights:
        profile.weights_json = json.dumps(profile_in.weights)

    db.commit()
    db.refresh(profile)
    
    # Return formatted schema
    return schemas.SensoryProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        texture=profile.texture,
        taste=profile.taste,
        spice=profile.spice,
        smell=profile.smell,
        temperature=profile.temperature,
        food_arrangement=profile.food_arrangement,
        predictability=profile.predictability,
        preferences=json.loads(profile.preferences_json) if profile.preferences_json else {},
        weights=json.loads(profile.weights_json) if profile.weights_json else {},
        updated_at=profile.updated_at
    )

@app.get("/sensory-profile/{user_id}", response_model=schemas.SensoryProfileResponse, tags=["Sensory Profile"])
def get_sensory_profile(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_default_profile(db, user_id)
    return schemas.SensoryProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        texture=profile.texture,
        taste=profile.taste,
        spice=profile.spice,
        smell=profile.smell,
        temperature=profile.temperature,
        food_arrangement=profile.food_arrangement,
        predictability=profile.predictability,
        preferences=json.loads(profile.preferences_json) if profile.preferences_json else {},
        weights=json.loads(profile.weights_json) if profile.weights_json else {},
        updated_at=profile.updated_at
    )

@app.get("/foods", response_model=List[schemas.FoodSchema], tags=["Foods"])
def get_foods(db: Session = Depends(get_db)):
    foods = db.query(models.Food).all()
    results = []
    for f in foods:
        s_profile = f.sensory_profile
        sp_schema = schemas.FoodSensoryProfileSchema(
            texture=s_profile.texture if s_profile else "Soft",
            taste_intensity=s_profile.taste_intensity if s_profile else 3.0,
            spice=s_profile.spice if s_profile else 2.0,
            smell_intensity=s_profile.smell_intensity if s_profile else 3.0,
            temperature=s_profile.temperature if s_profile else "Warm",
            mixed_texture=s_profile.mixed_texture if s_profile else False,
            crunchiness=s_profile.crunchiness if s_profile else 2.0,
            softness=s_profile.softness if s_profile else 8.0,
            chewiness=s_profile.chewiness if s_profile else 3.0,
            moisture=s_profile.moisture if s_profile else 7.0,
            predictability=s_profile.predictability if s_profile else 9.0,
            arrangement=s_profile.arrangement if s_profile else "Separate"
        )
        results.append(schemas.FoodSchema(
            id=f.id,
            name=f.name,
            category=f.category,
            description=f.description,
            ingredients=json.loads(f.ingredients_json) if f.ingredients_json else [],
            image_url=f.image_url,
            sensory_profile=sp_schema,
            sensory_load=schemas.SensoryLoadSchema(**compute_sensory_load(sp_schema))
        ))
    return results

@app.get("/foods/{food_id}", response_model=schemas.FoodSchema, tags=["Foods"])
def get_food(food_id: int, db: Session = Depends(get_db)):
    f = db.query(models.Food).filter(models.Food.id == food_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    s_profile = f.sensory_profile
    sp_schema = schemas.FoodSensoryProfileSchema(
        texture=s_profile.texture if s_profile else "Soft",
        taste_intensity=s_profile.taste_intensity if s_profile else 3.0,
        spice=s_profile.spice if s_profile else 2.0,
        smell_intensity=s_profile.smell_intensity if s_profile else 3.0,
        temperature=s_profile.temperature if s_profile else "Warm",
        mixed_texture=s_profile.mixed_texture if s_profile else False,
        crunchiness=s_profile.crunchiness if s_profile else 2.0,
        softness=s_profile.softness if s_profile else 8.0,
        chewiness=s_profile.chewiness if s_profile else 3.0,
        moisture=s_profile.moisture if s_profile else 7.0,
        predictability=s_profile.predictability if s_profile else 9.0,
        arrangement=s_profile.arrangement if s_profile else "Separate"
    )
    return schemas.FoodSchema(
        id=f.id,
        name=f.name,
        category=f.category,
        description=f.description,
        ingredients=json.loads(f.ingredients_json) if f.ingredients_json else [],
        image_url=f.image_url,
        sensory_profile=sp_schema,
        sensory_load=schemas.SensoryLoadSchema(**compute_sensory_load(sp_schema))
    )

@app.post("/analyze-food", response_model=schemas.FoodAnalysisResponse, tags=["AI Sensory Engine"])
def analyze_food(req: schemas.FoodAnalysisRequest, db: Session = Depends(get_db)):
    result = analyze_food_input(db, demo_food_id=req.demo_food_id, image_base64=req.image_base64)
    sensory_load = compute_sensory_load(result["sensory_profile"])
    return schemas.FoodAnalysisResponse(
        food_id=result["food_id"],
        food_name=result["food_name"],
        ingredients=result["ingredients"],
        sensory_profile=schemas.FoodSensoryProfileSchema(**result["sensory_profile"]),
        nutrition=schemas.NutritionSchema(**result["nutrition"]),
        confidence=result["confidence"],
        confidence_score=result.get("confidence_score", 0.95),
        recognized=result.get("recognized", True),
        uncertainties=result["uncertainties"],
        is_demo_fallback=result["is_demo_fallback"],
        detected_foods=result.get("detected_foods", []),
        message=result.get("message"),
        sensory_load=schemas.SensoryLoadSchema(**sensory_load)
    )

@app.post("/adapt-meal", response_model=schemas.AdaptMealResponse, tags=["Food Adaptation Engine"])
def adapt_meal_endpoint(req: schemas.AdaptMealRequest, db: Session = Depends(get_db)):
    """
    FEATURE 2 — Suggests concrete adaptations for a meal ("adapt the food to the
    person") and re-estimates compatibility after those adaptations.
    """
    profile = get_or_create_default_profile(db, req.user_id)
    food = db.query(models.Food).filter(models.Food.id == req.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    result = adaptation.adapt_meal(profile, food)
    if not result:
        raise HTTPException(status_code=400, detail="Unable to adapt this meal")
    return schemas.AdaptMealResponse(**result)

@app.post("/correct-uncertainty", tags=["AI Sensory Engine"])
def correct_uncertainty(req: schemas.UncertaintyCorrectionRequest, db: Session = Depends(get_db)):
    success = apply_uncertainty_correction(db, req.food_id, req.attribute, req.corrected_value)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update attribute")
    return {"status": "success", "message": f"Updated {req.attribute} based on human feedback."}

@app.post("/recommend", response_model=schemas.RecommendationResponse, tags=["Recommendation Engine"])
def recommend_foods(req: schemas.RecommendRequest, db: Session = Depends(get_db)):
    return generate_recommendations(db, user_id=req.user_id, food_ids=req.food_ids)

@app.post("/feedback", response_model=schemas.FeedbackResponse, tags=["Feedback & Learning Loop"])
def submit_feedback(req: schemas.FeedbackRequest, db: Session = Depends(get_db)):
    # 1. Save feedback item in DB
    fb = models.Feedback(
        user_id=req.user_id,
        food_id=req.food_id,
        rating=req.rating,
        tags_json=json.dumps(req.tags),
        comments=req.comments
    )
    db.add(fb)

    # 2. Update cafeteria aggregate metrics
    metrics = db.query(models.CafeteriaMetrics).filter(models.CafeteriaMetrics.id == 1).first()
    if not metrics:
        metrics = models.CafeteriaMetrics(id=1)
        db.add(metrics)

    metrics.total_analyzed += 1
    if req.rating in ["loved", "okay"]:
        metrics.accepted_count += 1
    else:
        metrics.rejected_count += 1

    total = metrics.accepted_count + metrics.rejected_count
    metrics.acceptance_rate = round((metrics.accepted_count / total) * 100.0, 1) if total > 0 else 74.5
    
    # Waste formula: rejected * portion_weight (250g = 0.25kg) * waste_factor (0.70)
    metrics.estimated_waste_kg = round(metrics.rejected_count * 0.250 * 0.70, 1)

    # 3. Learning loop: update user profile weights
    profile = db.query(models.SensoryProfile).filter(models.SensoryProfile.user_id == req.user_id).first()
    notice = None
    if profile and req.rating == "didnt_work":
        updated_weights_str, notice = update_user_weights_from_feedback(profile.weights_json, req.tags)
        profile.weights_json = updated_weights_str

    # 4. FEATURE 4 — Adaptive User Preferences: surface an insight when the
    # same characteristic keeps getting rejected. This is a simple local
    # tally of repeated feedback tags — NOT a detection or diagnosis of any
    # condition.
    preference_insight = None
    if req.rating == "didnt_work" and req.tags:
        past_rejections = db.query(models.Feedback).filter(
            models.Feedback.user_id == req.user_id,
            models.Feedback.rating == "didnt_work"
        ).order_by(models.Feedback.id.desc()).limit(30).all()

        tag_counts: Dict[str, int] = {}
        for row in past_rejections:
            try:
                for t in json.loads(row.tags_json):
                    tag_counts[t] = tag_counts.get(t, 0) + 1
            except Exception:
                pass
        for t in req.tags:
            tag_counts[t] = tag_counts.get(t, 0) + 1

        for tag, count in sorted(tag_counts.items(), key=lambda kv: -kv[1]):
            if count >= 3:
                preference_insight = f'"{tag}" appears to be an important sensory factor in your food preferences — future recommendations will weigh it more heavily.'
                break

    db.commit()

    return schemas.FeedbackResponse(
        status="success",
        message="Thank you! Your feedback helps customize recommendations and improve cafeteria meal planning.",
        updated_weights_notice=notice,
        preference_insight=preference_insight
    )

@app.get("/cafeteria/metrics", response_model=schemas.CafeteriaMetricsResponse, tags=["Cafeteria Insights"])
def get_cafeteria_metrics(db: Session = Depends(get_db)):
    metrics = db.query(models.CafeteriaMetrics).filter(models.CafeteriaMetrics.id == 1).first()
    if not metrics:
        metrics = models.CafeteriaMetrics(total_analyzed=247, accepted_count=184, rejected_count=63, acceptance_rate=74.5, estimated_waste_kg=11.0)

    explanation = (
        f"{metrics.rejected_count} rejected meals × 250g avg portion × 0.70 estimated uneaten fraction "
        f"= {metrics.estimated_waste_kg} kg estimated potentially avoidable waste."
    )
    return schemas.CafeteriaMetricsResponse(
        total_analyzed=metrics.total_analyzed,
        accepted_count=metrics.accepted_count,
        rejected_count=metrics.rejected_count,
        acceptance_rate=metrics.acceptance_rate,
        estimated_avoidable_waste_kg=metrics.estimated_waste_kg,
        waste_formula_explanation=explanation
    )

@app.get("/cafeteria/insights", response_model=schemas.CafeteriaInsightsResponse, tags=["Cafeteria Insights"])
def get_cafeteria_insights(db: Session = Depends(get_db)):
    metrics_res = get_cafeteria_metrics(db)
    
    most_accepted = [
        "Soft textures (Idli, Paneer, Soft Sandwich)",
        "Mild spice level (0-3/10)",
        "Low smell intensity",
        "High predictability (Familiar meals)",
        "Separate component arrangement"
    ]
    
    frequently_rejected = [
        "High spice level (> 5/10)",
        "Strong smell intensity (> 6/10)",
        "Mixed textures / crispy toppings",
        "Very crunchy components"
    ]

    action = (
        "Consider preparing fewer portions of high-spice/strong-smell meals and increasing "
        "flexible mild/soft alternatives based on observed prototype-user patterns."
    )

    return schemas.CafeteriaInsightsResponse(
        metrics=metrics_res,
        most_accepted_traits=most_accepted,
        frequently_rejected_traits=frequently_rejected,
        suggested_action=action,
        simulated_waste_reduction_percent=18.4,
        disclaimer="ESTIMATE & SIMULATION — based on anonymous prototype sample data, not measured physical waste."
    )

@app.get("/cafeteria/predict-menu", response_model=schemas.MenuPredictionResponse, tags=["Cafeteria Insights"])
def predict_menu(db: Session = Depends(get_db)):
    """
    FEATURE 5 — Meal Acceptance Prediction.
    Estimates expected compatibility for each catalog item against the
    prototype demo profile. Clearly a prototype estimate, not a guarantee.
    """
    profile = get_or_create_default_profile(db, user_id=1)
    foods = db.query(models.Food).all()

    items = []
    for food in foods:
        s_profile = food.sensory_profile
        if not s_profile:
            continue
        score, _, _ = compute_sensory_compatibility(profile, s_profile)
        items.append(schemas.MenuPredictionItem(food_id=food.id, food_name=food.name, expected_compatibility=score))

    items.sort(key=lambda x: x.expected_compatibility, reverse=True)

    return schemas.MenuPredictionResponse(
        items=items,
        disclaimer="Prototype estimates based on anonymous aggregate feedback and sample sensory profiles — not measured acceptance."
    )

@app.post("/demo/reset", tags=["Demo Mode"])
def reset_demo_data(db: Session = Depends(get_db)):
    # Resets demo state to initial seed state
    metrics = db.query(models.CafeteriaMetrics).filter(models.CafeteriaMetrics.id == 1).first()
    if metrics:
        metrics.total_analyzed = 247
        metrics.accepted_count = 184
        metrics.rejected_count = 63
        metrics.acceptance_rate = 74.5
        metrics.estimated_waste_kg = 11.0
    
    # Reset Alex's profile to default Soft, Mild, Low Smell
    profile = db.query(models.SensoryProfile).filter(models.SensoryProfile.user_id == 1).first()
    if profile:
        profile.texture = "Soft"
        profile.taste = "Mild"
        profile.spice = "Mild"
        profile.smell = "Low"
        profile.temperature = "Warm"
        profile.food_arrangement = "Separate"
        profile.predictability = "Familiar foods preferred"
        profile.preferences_json = json.dumps({"texture": "Preferred", "spice": "Avoid", "smell": "Avoid"})
        profile.weights_json = "{}"

    db.commit()
    return {"status": "success", "message": "Demo data reset to initial baseline state."}
