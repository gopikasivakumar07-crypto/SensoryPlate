import json
from types import SimpleNamespace
from typing import Any, Dict, Optional

import models
from sensory_engine import compute_sensory_compatibility


def _profile_to_namespace(s_profile: models.FoodSensoryProfile) -> SimpleNamespace:
    return SimpleNamespace(
        texture=s_profile.texture,
        taste_intensity=s_profile.taste_intensity,
        spice=s_profile.spice,
        smell_intensity=s_profile.smell_intensity,
        temperature=s_profile.temperature,
        mixed_texture=s_profile.mixed_texture,
        crunchiness=s_profile.crunchiness,
        softness=s_profile.softness,
        chewiness=s_profile.chewiness,
        moisture=s_profile.moisture,
        predictability=s_profile.predictability,
        arrangement=s_profile.arrangement,
    )


def adapt_meal(user_profile: models.SensoryProfile, food: models.Food) -> Optional[Dict[str, Any]]:
    """
    FEATURE 2 — Food Adaptation Engine.

    Instead of only rejecting an unsuitable meal, suggests concrete
    adaptations ("adapt the food to the person, not the other way around")
    and re-estimates compatibility after those adaptations. These are
    suggested adaptations, not a guarantee the modified meal will be
    accepted.
    """
    s_profile = food.sensory_profile
    if not s_profile:
        return None

    before_score, _, _ = compute_sensory_compatibility(user_profile, s_profile)

    adapted = _profile_to_namespace(s_profile)
    adaptations = []

    user_prefs = {}
    if user_profile.preferences_json:
        try:
            user_prefs = json.loads(user_profile.preferences_json)
        except Exception:
            pass

    # Spice
    if adapted.spice > 4.0 and (user_profile.spice in ("None", "Mild") or user_prefs.get('spice') == 'Avoid'):
        adapted.spice = round(adapted.spice * 0.35, 1)
        adaptations.append("Reduce spice level / prepare a mild version")

    # Smell — serving aromatic components separately reduces perceived smell intensity
    if adapted.smell_intensity > 5.0 and (user_profile.smell == "Low" or user_prefs.get('smell') == 'Avoid'):
        adapted.smell_intensity = round(adapted.smell_intensity * 0.6, 1)
        adaptations.append("Serve strong-smelling components (chutney / sauce) separately")

    # Mixed texture / arrangement
    if adapted.mixed_texture and user_profile.food_arrangement == "Separate":
        adapted.mixed_texture = False
        adapted.arrangement = "Separate"
        adaptations.append("Keep food components separate instead of mixed")

    # Crunchiness / toppings
    if adapted.crunchiness > 6.0 and user_profile.texture == "Soft":
        adapted.crunchiness = round(adapted.crunchiness * 0.5, 1)
        adapted.softness = min(10.0, adapted.softness + 2.0)
        adaptations.append("Remove crispy / crunchy toppings")

    # Temperature
    if adapted.temperature != user_profile.temperature and user_profile.temperature in ("Cold", "Room temperature", "Warm", "Hot"):
        adapted.temperature = user_profile.temperature
        adaptations.append(f"Adjust serving temperature to {user_profile.temperature}")

    if not adaptations:
        adaptations.append("Keep food components separate")
        adaptations.append("Serve at your preferred temperature")

    after_score, _, _ = compute_sensory_compatibility(user_profile, adapted)
    # Adaptations are suggestions, not guarantees — keep a realistic ceiling
    after_score = round(min(after_score, 96.0), 1)

    return {
        "food_id": food.id,
        "food_name": food.name,
        "before_score": before_score,
        "after_score": after_score,
        "adaptations": adaptations,
        "disclaimer": "These are suggested adaptations, not a guarantee the modified meal will be accepted."
    }
