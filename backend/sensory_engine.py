import json
from typing import Dict, Any, Tuple, List

# Default feature weights
DEFAULT_WEIGHTS = {
    "texture": 0.25,
    "taste": 0.15,
    "spice": 0.15,
    "smell": 0.15,
    "temperature": 0.10,
    "predictability": 0.10,
    "arrangement": 0.10
}

def calculate_spice_match(user_spice: str, food_spice: float) -> float:
    # Food spice level 0-10
    target_levels = {
        "None": 0.5,
        "Mild": 3.0,
        "Medium": 6.0,
        "High": 9.0
    }
    target = target_levels.get(user_spice, 3.0)
    diff = abs(target - food_spice)
    # Convert diff (0 to 10) to score (1.0 to 0.0)
    score = max(0.0, 1.0 - (diff / 7.0))
    return score

def calculate_smell_match(user_smell: str, food_smell: float) -> float:
    target_levels = {
        "Low": 2.0,
        "Medium": 5.0,
        "Strong": 8.5
    }
    target = target_levels.get(user_smell, 2.0)
    diff = abs(target - food_smell)
    return max(0.0, 1.0 - (diff / 7.0))

def calculate_taste_match(user_taste: str, food_taste: float) -> float:
    target_levels = {
        "Mild": 2.5,
        "Medium": 5.5,
        "Strong": 8.5
    }
    target = target_levels.get(user_taste, 2.5)
    diff = abs(target - food_taste)
    return max(0.0, 1.0 - (diff / 7.0))

def calculate_texture_match(user_texture: str, food_p: Any) -> float:
    # food_p can be dict or object
    f_texture = getattr(food_p, 'texture', None) or food_p.get('texture', '')
    softness = getattr(food_p, 'softness', None) if hasattr(food_p, 'softness') else food_p.get('softness', 5)
    crunchiness = getattr(food_p, 'crunchiness', None) if hasattr(food_p, 'crunchiness') else food_p.get('crunchiness', 5)
    mixed = getattr(food_p, 'mixed_texture', None) if hasattr(food_p, 'mixed_texture') else food_p.get('mixed_texture', False)

    if user_texture.lower() in f_texture.lower():
        return 1.0
    
    if user_texture == "Soft" and softness >= 6.5:
        return 0.95
    elif user_texture in ["Crunchy", "Crispy"] and crunchiness >= 6.0:
        return 0.95
    elif user_texture == "Mixed textures" and mixed:
        return 1.0
    elif user_texture == "Smooth" and softness >= 8.0 and not mixed:
        return 0.95
    
    # Partial match calculation
    return 0.5

def calculate_temp_match(user_temp: str, food_temp: str) -> float:
    if user_temp.lower() == food_temp.lower():
        return 1.0
    # Adjacent temperatures get partial credit
    temps = ["Cold", "Room temperature", "Warm", "Hot"]
    if user_temp in temps and food_temp in temps:
        idx1 = temps.index(user_temp)
        idx2 = temps.index(food_temp)
        diff = abs(idx1 - idx2)
        if diff == 1:
            return 0.7
        elif diff == 2:
            return 0.3
    return 0.1

def calculate_predictability_match(user_predictability: str, food_predictability: float) -> float:
    # Predictability 0-10
    if "Familiar" in user_predictability:
        return min(1.0, food_predictability / 8.0)
    else:
        # Open to new foods
        return 0.9

def calculate_arrangement_match(user_arrangement: str, food_arrangement: str) -> float:
    if user_arrangement == "Either" or user_arrangement.lower() == food_arrangement.lower():
        return 1.0
    return 0.3

def compute_sensory_compatibility(user_profile: Any, food_profile: Any) -> Tuple[float, Dict[str, float], List[str]]:
    """
    Computes overall compatibility (0-100%), component match breakdown,
    and explainable list of reasons (✓ matches, ⚠ warnings).
    """
    # Parse custom weights if present
    weights = DEFAULT_WEIGHTS.copy()
    if hasattr(user_profile, 'weights_json') and user_profile.weights_json:
        try:
            custom_w = json.loads(user_profile.weights_json)
            if isinstance(custom_w, dict) and custom_w:
                weights.update(custom_w)
        except Exception:
            pass

    # Parse user preferences (Avoid / Neutral / Preferred)
    user_prefs = {}
    if hasattr(user_profile, 'preferences_json') and user_profile.preferences_json:
        try:
            user_prefs = json.loads(user_profile.preferences_json)
        except Exception:
            pass

    # Individual dimension match scores (0.0 to 1.0)
    texture_m = calculate_texture_match(getattr(user_profile, 'texture', 'Soft'), food_profile)
    taste_m = calculate_taste_match(getattr(user_profile, 'taste', 'Mild'), getattr(food_profile, 'taste_intensity', 5.0))
    spice_m = calculate_spice_match(getattr(user_profile, 'spice', 'Mild'), getattr(food_profile, 'spice', 3.0))
    smell_m = calculate_smell_match(getattr(user_profile, 'smell', 'Low'), getattr(food_profile, 'smell_intensity', 4.0))
    temp_m = calculate_temp_match(getattr(user_profile, 'temperature', 'Warm'), getattr(food_profile, 'temperature', 'Warm'))
    pred_m = calculate_predictability_match(getattr(user_profile, 'predictability', 'Familiar foods preferred'), getattr(food_profile, 'predictability', 8.0))
    arr_m = calculate_arrangement_match(getattr(user_profile, 'food_arrangement', 'Separate'), getattr(food_profile, 'arrangement', 'Separate'))

    breakdown = {
        "texture_match": round(texture_m * 100, 1),
        "taste_match": round(taste_m * 100, 1),
        "spice_match": round(spice_m * 100, 1),
        "smell_match": round(smell_m * 100, 1),
        "temperature_match": round(temp_m * 100, 1),
        "predictability_match": round(pred_m * 100, 1),
        "arrangement_match": round(arr_m * 100, 1),
    }

    # Weighted sum calculation
    total_weight = sum(weights.values())
    raw_score = (
        texture_m * weights["texture"] +
        taste_m * weights["taste"] +
        spice_m * weights["spice"] +
        smell_m * weights["smell"] +
        temp_m * weights["temperature"] +
        pred_m * weights["predictability"] +
        arr_m * weights["arrangement"]
    ) / total_weight

    score = raw_score * 100.0

    # Apply AVOID penalties if applicable
    avoid_penalties = []
    f_spice = getattr(food_profile, 'spice', 3.0)
    f_smell = getattr(food_profile, 'smell_intensity', 4.0)
    f_crunch = getattr(food_profile, 'crunchiness', 2.0)
    f_mixed = getattr(food_profile, 'mixed_texture', False)

    if user_prefs.get('spice') == 'Avoid' and f_spice > 4.0:
        score *= 0.5
        avoid_penalties.append("⚠ Contains high spice marked as avoid")
    if user_prefs.get('smell') == 'Avoid' and f_smell > 6.0:
        score *= 0.6
        avoid_penalties.append("⚠ Strong smell intensity marked as avoid")
    if user_prefs.get('texture') == 'Avoid' and f_crunch > 6.0 and user_profile.texture != "Crunchy":
        score *= 0.6
        avoid_penalties.append("⚠ High crunchiness marked as avoid")
    if user_prefs.get('food_arrangement') == 'Avoid' and f_mixed and user_profile.food_arrangement == "Separate":
        score *= 0.7
        avoid_penalties.append("⚠ Mixed texture/arrangement marked as avoid")

    score = max(5.0, min(99.0, round(score, 1)))

    # Construct explainable reasons
    explanations = []
    
    # Texture explanation
    if texture_m >= 0.8:
        explanations.append(f"✓ {getattr(user_profile, 'texture', 'Soft')} texture matches preference")
    else:
        explanations.append(f"⚠ Texture differs from preferred ({getattr(user_profile, 'texture', 'Soft')})")

    # Spice explanation
    if spice_m >= 0.8:
        explanations.append(f"✓ {getattr(user_profile, 'spice', 'Mild')} spice level matches preference")
    else:
        explanations.append(f"⚠ Spice level ({f_spice:.1f}/10) differs from preference ({getattr(user_profile, 'spice', 'Mild')})")

    # Smell explanation
    if smell_m >= 0.8:
        explanations.append(f"✓ Low/moderate smell intensity ({f_smell:.1f}/10)")
    else:
        explanations.append(f"⚠ Stronger smell intensity ({f_smell:.1f}/10)")

    # Temperature
    if temp_m >= 0.9:
        explanations.append(f"✓ Ideal {getattr(user_profile, 'temperature', 'Warm')} temperature")
    elif temp_m >= 0.6:
        explanations.append(f"⚠ Temperature slightly higher/lower than preferred")

    # Predictability
    if pred_m >= 0.8:
        explanations.append("✓ High predictability, familiar meal structure")
    else:
        explanations.append("⚠ Novel or complex food composition")

    # Add any explicit avoid penalties
    explanations.extend(avoid_penalties)

    return score, breakdown, explanations

def compute_sensory_load(food_profile: Any) -> Dict[str, Any]:
    """
    FEATURE 1 — Sensory Load Prediction.
    Estimates how sensory-demanding a food may be to process (texture
    complexity, smell, spice, mixed textures, visual/ingredient complexity,
    temperature) — independent of any single person's preferences.
    This is an AI-assisted estimate, NOT a medical assessment or diagnosis.
    """
    def g(attr, default):
        if hasattr(food_profile, attr):
            val = getattr(food_profile, attr)
            return val if val is not None else default
        if isinstance(food_profile, dict):
            return food_profile.get(attr, default)
        return default

    crunchiness = float(g('crunchiness', 2.0) or 0.0)
    smell = float(g('smell_intensity', 4.0) or 0.0)
    spice = float(g('spice', 3.0) or 0.0)
    mixed = bool(g('mixed_texture', False))
    arrangement = str(g('arrangement', 'Separate') or 'Separate')
    temperature = str(g('temperature', 'Warm') or 'Warm')

    reasons = []
    load = 0.0

    # Texture complexity (0-25)
    texture_component = min(25.0, (crunchiness / 10.0) * 15.0 + (10.0 if mixed else 0.0))
    load += texture_component
    if mixed:
        reasons.append("Mixed textures in one dish")
    if crunchiness >= 6.0:
        reasons.append("Crispy / crunchy texture")

    # Smell intensity (0-20)
    load += (smell / 10.0) * 20.0
    if smell >= 6.0:
        reasons.append("Strong smell")
    elif smell >= 4.0:
        reasons.append("Noticeable smell")

    # Spice intensity (0-20)
    load += (spice / 10.0) * 20.0
    if spice >= 6.0:
        reasons.append("High spice intensity")
    elif spice >= 3.5:
        reasons.append("Moderate spice level")

    # Visual / ingredient complexity (0-20)
    visual_component = 10.0 if arrangement.lower() == 'combined' else 0.0
    if mixed:
        visual_component += 5.0
    load += visual_component
    if arrangement.lower() == 'combined':
        reasons.append("Multiple ingredients combined together")

    # Temperature extremity (0-15)
    if temperature in ('Hot', 'Cold'):
        load += 12.0
        reasons.append(f"Served {temperature.lower()}")
    else:
        load += 3.0

    score = int(max(0, min(100, round(load))))

    if score >= 66:
        level = "HIGH"
    elif score >= 35:
        level = "MEDIUM"
    else:
        level = "LOW"

    if not reasons:
        reasons.append("Simple, low-complexity sensory profile")

    return {
        "score": score,
        "level": level,
        "reasons": reasons[:5],
        "disclaimer": "AI-assisted estimate of general sensory demand — not a medical assessment or diagnosis."
    }


def update_user_weights_from_feedback(current_weights_json: str, tags: List[str]) -> Tuple[str, str]:
    """
    Learning loop: auto-adjust weight multipliers when user rejects meals due to specific attributes.
    """
    weights = DEFAULT_WEIGHTS.copy()
    if current_weights_json:
        try:
            parsed = json.loads(current_weights_json)
            if isinstance(parsed, dict) and parsed:
                weights.update(parsed)
        except Exception:
            pass

    updated = False
    for tag in tags:
        tag_lower = tag.lower()
        if "spicy" in tag_lower:
            weights["spice"] = min(0.35, weights.get("spice", 0.15) + 0.05)
            updated = True
        elif "crunchy" in tag_lower or "soft" in tag_lower or "texture" in tag_lower:
            weights["texture"] = min(0.40, weights.get("texture", 0.25) + 0.05)
            updated = True
        elif "smell" in tag_lower:
            weights["smell"] = min(0.35, weights.get("smell", 0.15) + 0.05)
            updated = True
        elif "hot" in tag_lower or "cold" in tag_lower:
            weights["temperature"] = min(0.25, weights.get("temperature", 0.10) + 0.04)
            updated = True

    if updated:
        # Normalize weights
        total = sum(weights.values())
        weights = {k: round(v / total, 3) for k, v in weights.items()}
        notice = "Your preferences are becoming more personalized based on your feedback."
    else:
        notice = "Feedback saved successfully."

    return json.dumps(weights), notice
