import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models
import schemas
from sensory_engine import compute_sensory_compatibility

def get_or_create_default_profile(db: Session, user_id: int) -> models.SensoryProfile:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        user = models.User(id=user_id, username=f"user_{user_id}")
        db.add(user)
        db.commit()
        db.refresh(user)

    profile = db.query(models.SensoryProfile).filter(models.SensoryProfile.user_id == user_id).first()
    if not profile:
        profile = models.SensoryProfile(
            user_id=user_id,
            texture="Soft",
            taste="Mild",
            spice="Mild",
            smell="Low",
            temperature="Warm",
            food_arrangement="Separate",
            predictability="Familiar foods preferred",
            preferences_json=json.dumps({"texture": "Preferred", "spice": "Avoid", "smell": "Avoid"}),
            weights_json="{}"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile

def generate_recommendations(db: Session, user_id: int = 1, food_ids: List[int] = None) -> schemas.RecommendationResponse:
    profile = get_or_create_default_profile(db, user_id)

    query = db.query(models.Food)
    if food_ids:
        query = query.filter(models.Food.id.in_(food_ids))
    foods = query.all()

    items = []
    for food in foods:
        s_profile = food.sensory_profile
        if not s_profile:
            continue
        
        score, breakdown_dict, explanations = compute_sensory_compatibility(profile, s_profile)
        ingredients = json.loads(food.ingredients_json) if food.ingredients_json else []

        item = schemas.RecommendationItem(
            food_id=food.id,
            food_name=food.name,
            ingredients=ingredients,
            compatibility_score=score,
            match_breakdown=schemas.CompatibilityBreakdown(**breakdown_dict),
            explanations=explanations,
            suitable=score >= 65.0
        )
        items.append(item)

    # Sort descending by compatibility score
    items.sort(key=lambda x: x.compatibility_score, reverse=True)

    best_matches = [x for x in items if x.suitable]
    less_suitable = [x for x in items if not x.suitable]

    notice = "Matching generated using your personalized sensory preferences."
    if profile.weights_json and len(profile.weights_json) > 5:
        notice = "Your preferences are becoming more personalized based on your feedback history."

    return schemas.RecommendationResponse(
        user_id=user_id,
        best_matches=best_matches,
        less_suitable=less_suitable,
        personalization_notice=notice
    )
