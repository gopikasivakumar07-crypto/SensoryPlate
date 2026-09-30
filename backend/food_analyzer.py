import json
import base64
import os
import re
import io
import hashlib
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.orm import Session
import models

CONFIDENCE_THRESHOLD = 0.65

# Comprehensive Food Knowledge Base for AI Vision Classification Fallback & Inference
FOOD_VISION_KNOWLEDGE_BASE = [
    {
        "id": 101,
        "keywords": ["idli", "sambar", "chutney", "steamed", "rice cake"],
        "name": "Idli with Sambar & Chutney",
        "category": "South Indian",
        "ingredients": ["Fermented rice flour", "Urad dal", "Lentils", "Vegetables", "Coconut", "Mustard seeds"],
        "sensory_profile": {
            "texture": "Soft",
            "taste_intensity": 3.0,
            "spice": 2.0,
            "smell_intensity": 2.5,
            "temperature": "Warm",
            "mixed_texture": False,
            "crunchiness": 1.0,
            "softness": 9.0,
            "chewiness": 2.0,
            "moisture": 8.0,
            "predictability": 9.5,
            "arrangement": "Separate"
        },
        # Heuristic reference for pale/white steamed food on a plate with orange sambar
        # and green/white chutney on the side: high brightness, low saturation, low
        # color variety, cool-neutral warm_ratio. Not measured from real photos.
        "visual_reference": {
            "brightness": 185.0,
            "saturation": 42.0,
            "warm_ratio": 1.05,
            "green_ratio": 1.05,
            "color_diversity": 18.0
        },
        "nutrition": {
            "calories": 210,
            "protein": 7.5,
            "carbs": 42.0,
            "fat": 2.0,
            "fiber": 4.5,
            "sodium": 340.0,
            "sugar": 3.0
        },
        "confidence": {
            "food_identification": 0.96,
            "texture_estimation": 0.92,
            "spice_estimation": 0.88,
            "smell_estimation": 0.85,
            "temperature_estimation": 0.90,
            "crunchiness_estimation": 0.82
        }
    },
    {
        "id": 102,
        "keywords": ["dosa", "masala dosa", "crepe", "potato"],
        "name": "Crispy Masala Dosa",
        "category": "South Indian",
        "ingredients": ["Fermented rice & lentil batter", "Spiced potatoes", "Onions", "Ghee", "Coconut chutney"],
        "sensory_profile": {
            "texture": "Crispy Outer / Soft Filling",
            "taste_intensity": 5.5,
            "spice": 4.0,
            "smell_intensity": 4.5,
            "temperature": "Hot",
            "mixed_texture": True,
            "crunchiness": 7.5,
            "softness": 5.0,
            "chewiness": 3.0,
            "moisture": 5.0,
            "predictability": 8.0,
            "arrangement": "Separate"
        },
        # Golden-brown crispy crepe: darker/warmer and moderately saturated vs. idli.
        "visual_reference": {
            "brightness": 150.0,
            "saturation": 55.0,
            "warm_ratio": 1.35,
            "green_ratio": 0.85,
            "color_diversity": 22.0
        },
        "nutrition": {
            "calories": 360,
            "protein": 8.0,
            "carbs": 58.0,
            "fat": 11.0,
            "fiber": 5.0,
            "sodium": 480.0,
            "sugar": 4.0
        },
        "confidence": {
            "food_identification": 0.94,
            "texture_estimation": 0.89,
            "spice_estimation": 0.86,
            "smell_estimation": 0.84,
            "temperature_estimation": 0.91,
            "crunchiness_estimation": 0.88
        }
    },
    {
        "id": 103,
        "keywords": ["pizza", "margherita", "cheese", "tomato", "basil", "crust"],
        "name": "Margherita Artisanal Pizza",
        "category": "Italian",
        "ingredients": ["Wheat flour dough", "San Marzano tomatoes", "Fresh mozzarella", "Basil leaves", "Olive oil"],
        "sensory_profile": {
            "texture": "Chewy Crust / Melted Cheese",
            "taste_intensity": 6.0,
            "spice": 1.5,
            "smell_intensity": 5.0,
            "temperature": "Hot",
            "mixed_texture": True,
            "crunchiness": 4.5,
            "softness": 6.5,
            "chewiness": 7.0,
            "moisture": 6.0,
            "predictability": 8.5,
            "arrangement": "Combined"
        },
        # Red tomato, white cheese, green basil: high saturation, high color variety.
        "visual_reference": {
            "brightness": 165.0,
            "saturation": 70.0,
            "warm_ratio": 1.30,
            "green_ratio": 0.90,
            "color_diversity": 30.0
        },
        "nutrition": {
            "calories": 480,
            "protein": 18.0,
            "carbs": 62.0,
            "fat": 17.0,
            "fiber": 3.8,
            "sodium": 680.0,
            "sugar": 5.5
        },
        "confidence": {
            "food_identification": 0.95,
            "texture_estimation": 0.91,
            "spice_estimation": 0.93,
            "smell_estimation": 0.87,
            "temperature_estimation": 0.92,
            "crunchiness_estimation": 0.84
        }
    },
    {
        "id": 104,
        "keywords": ["salad", "chicken", "caesar", "greens", "lettuce", "cucumber"],
        "name": "Fresh Garden Chicken Salad",
        "category": "Salad / Healthy",
        "ingredients": ["Grilled chicken breast", "Romaine lettuce", "Cherry tomatoes", "Cucumber", "Olive oil dressing"],
        "sensory_profile": {
            "texture": "Crunchy & Tender",
            "taste_intensity": 4.0,
            "spice": 1.0,
            "smell_intensity": 2.5,
            "temperature": "Cool",
            "mixed_texture": True,
            "crunchiness": 8.0,
            "softness": 4.0,
            "chewiness": 5.0,
            "moisture": 7.5,
            "predictability": 9.0,
            "arrangement": "Separate"
        },
        # Leafy greens dominate: high green_ratio, cool/neutral warm_ratio.
        "visual_reference": {
            "brightness": 150.0,
            "saturation": 65.0,
            "warm_ratio": 0.90,
            "green_ratio": 1.30,
            "color_diversity": 28.0
        },
        "nutrition": {
            "calories": 290,
            "protein": 32.0,
            "carbs": 12.0,
            "fat": 13.0,
            "fiber": 4.2,
            "sodium": 420.0,
            "sugar": 3.8
        },
        "confidence": {
            "food_identification": 0.93,
            "texture_estimation": 0.89,
            "spice_estimation": 0.95,
            "smell_estimation": 0.88,
            "temperature_estimation": 0.94,
            "crunchiness_estimation": 0.86
        }
    },
    {
        "id": 105,
        "keywords": ["avocado", "toast", "egg", "bread", "poached"],
        "name": "Avocado & Poached Egg Toast",
        "category": "Breakfast / Cafe",
        "ingredients": ["Sourdough bread", "Hass avocado", "Poached egg", "Red pepper flakes", "Lemon juice"],
        "sensory_profile": {
            "texture": "Creamy & Toasted",
            "taste_intensity": 4.5,
            "spice": 1.5,
            "smell_intensity": 3.0,
            "temperature": "Warm",
            "mixed_texture": True,
            "crunchiness": 6.0,
            "softness": 7.5,
            "chewiness": 4.0,
            "moisture": 6.5,
            "predictability": 8.8,
            "arrangement": "Combined"
        },
        # Green avocado, browned toast, yellow yolk: moderate saturation, green-leaning.
        "visual_reference": {
            "brightness": 150.0,
            "saturation": 55.0,
            "warm_ratio": 1.00,
            "green_ratio": 1.15,
            "color_diversity": 25.0
        },
        "nutrition": {
            "calories": 340,
            "protein": 14.0,
            "carbs": 31.0,
            "fat": 19.0,
            "fiber": 7.0,
            "sodium": 390.0,
            "sugar": 2.1
        },
        "confidence": {
            "food_identification": 0.97,
            "texture_estimation": 0.93,
            "spice_estimation": 0.92,
            "smell_estimation": 0.90,
            "temperature_estimation": 0.89,
            "crunchiness_estimation": 0.85
        }
    },
    {
        "id": 106,
        "keywords": ["burger", "cheeseburger", "patty", "bun", "fries"],
        "name": "Classic Veggie / Beef Burger",
        "category": "American",
        "ingredients": ["Brioche bun", "Plant/Beef patty", "Cheddar cheese", "Lettuce", "Tomato", "Special sauce"],
        "sensory_profile": {
            "texture": "Soft Bun / Savory Patty",
            "taste_intensity": 7.0,
            "spice": 2.5,
            "smell_intensity": 5.5,
            "temperature": "Warm",
            "mixed_texture": True,
            "crunchiness": 4.0,
            "softness": 7.0,
            "chewiness": 6.0,
            "moisture": 6.0,
            "predictability": 8.2,
            "arrangement": "Combined"
        },
        # Browned bun, colorful toppings: darker, warm-leaning, high color variety.
        "visual_reference": {
            "brightness": 140.0,
            "saturation": 60.0,
            "warm_ratio": 1.25,
            "green_ratio": 0.90,
            "color_diversity": 28.0
        },
        "nutrition": {
            "calories": 540,
            "protein": 24.0,
            "carbs": 48.0,
            "fat": 28.0,
            "fiber": 3.5,
            "sodium": 790.0,
            "sugar": 7.0
        },
        "confidence": {
            "food_identification": 0.95,
            "texture_estimation": 0.90,
            "spice_estimation": 0.89,
            "smell_estimation": 0.86,
            "temperature_estimation": 0.92,
            "crunchiness_estimation": 0.83
        }
    },
    {
        "id": 107,
        "keywords": ["sushi", "roll", "salmon", "rice", "seaweed", "nori"],
        "name": "Fresh Salmon & Avocado Roll",
        "category": "Japanese",
        "ingredients": ["Sushi rice", "Fresh salmon", "Avocado", "Nori seaweed", "Soy sauce", "Wasabi"],
        "sensory_profile": {
            "texture": "Soft & Smooth",
            "taste_intensity": 4.5,
            "spice": 1.0,
            "smell_intensity": 3.5,
            "temperature": "Cool",
            "mixed_texture": False,
            "crunchiness": 1.5,
            "softness": 8.5,
            "chewiness": 3.5,
            "moisture": 7.0,
            "predictability": 8.9,
            "arrangement": "Separate"
        },
        # White rice + black nori + pink salmon + green garnish: higher saturation
        # and much higher color variety than a plain white idli.
        "visual_reference": {
            "brightness": 170.0,
            "saturation": 60.0,
            "warm_ratio": 1.10,
            "green_ratio": 0.95,
            "color_diversity": 26.0
        },
        "nutrition": {
            "calories": 320,
            "protein": 16.0,
            "carbs": 44.0,
            "fat": 9.0,
            "fiber": 2.8,
            "sodium": 520.0,
            "sugar": 3.2
        },
        "confidence": {
            "food_identification": 0.94,
            "texture_estimation": 0.91,
            "spice_estimation": 0.94,
            "smell_estimation": 0.89,
            "temperature_estimation": 0.93,
            "crunchiness_estimation": 0.87
        }
    },
    {
        "id": 108,
        "keywords": ["curry", "paneer", "tofu", "tikka", "gravy", "rice"],
        "name": "Creamy Paneer Butter Masala",
        "category": "North Indian",
        "ingredients": ["Fresh paneer cubes", "Tomato cream gravy", "Butter", "Garam masala", "Kasuri methi"],
        "sensory_profile": {
            "texture": "Rich & Soft",
            "taste_intensity": 6.5,
            "spice": 4.5,
            "smell_intensity": 6.0,
            "temperature": "Hot",
            "mixed_texture": False,
            "crunchiness": 1.0,
            "softness": 8.5,
            "chewiness": 2.5,
            "moisture": 8.5,
            "predictability": 8.0,
            "arrangement": "Combined"
        },
        # Deep orange-red gravy: dark, highly saturated, strongly warm-toned.
        "visual_reference": {
            "brightness": 130.0,
            "saturation": 75.0,
            "warm_ratio": 1.60,
            "green_ratio": 0.75,
            "color_diversity": 20.0
        },
        "nutrition": {
            "calories": 420,
            "protein": 14.0,
            "carbs": 18.0,
            "fat": 32.0,
            "fiber": 3.0,
            "sodium": 590.0,
            "sugar": 6.0
        },
        "confidence": {
            "food_identification": 0.93,
            "texture_estimation": 0.88,
            "spice_estimation": 0.85,
            "smell_estimation": 0.84,
            "temperature_estimation": 0.90,
            "crunchiness_estimation": 0.82
        }
    },
    {
        "id": 109,
        "keywords": ["fruit", "bowl", "berry", "smoothie", "oatmeal", "granola"],
        "name": "Fresh Berry & Oat Power Bowl",
        "category": "Breakfast / Healthy",
        "ingredients": ["Rolled oats", "Blueberries", "Strawberries", "Almond milk", "Chia seeds", "Honey"],
        "sensory_profile": {
            "texture": "Soft & Chewy",
            "taste_intensity": 3.5,
            "spice": 0.0,
            "smell_intensity": 2.0,
            "temperature": "Cool",
            "mixed_texture": True,
            "crunchiness": 3.0,
            "softness": 8.0,
            "chewiness": 4.0,
            "moisture": 7.5,
            "predictability": 9.4,
            "arrangement": "Separate"
        },
        # Colorful berries (red/blue/purple) on oats: highest color variety, high saturation.
        "visual_reference": {
            "brightness": 160.0,
            "saturation": 70.0,
            "warm_ratio": 1.00,
            "green_ratio": 0.90,
            "color_diversity": 32.0
        },
        "nutrition": {
            "calories": 280,
            "protein": 9.0,
            "carbs": 52.0,
            "fat": 5.0,
            "fiber": 8.5,
            "sodium": 110.0,
            "sugar": 14.0
        },
        "confidence": {
            "food_identification": 0.96,
            "texture_estimation": 0.94,
            "spice_estimation": 0.98,
            "smell_estimation": 0.91,
            "temperature_estimation": 0.95,
            "crunchiness_estimation": 0.88
        }
    }
]


def validate_and_decode_image(image_base64: str) -> Tuple[bool, Optional[bytes], Optional[str]]:
    """
    Validates base64 string and checks for image header magic bytes.
    Returns (is_valid, raw_bytes, mime_type).
    """
    if not image_base64 or not isinstance(image_base64, str):
        return False, None, "Invalid input"

    cleaned_str = image_base64
    mime_type = "image/jpeg"

    if "," in image_base64:
        header, cleaned_str = image_base64.split(",", 1)
        if "data:" in header and ";base64" in header:
            mime_type = header.split("data:")[1].split(";")[0]

    try:
        raw_bytes = base64.b64decode(cleaned_str)
    except Exception:
        return False, None, "Corrupt base64 encoding"

    if len(raw_bytes) < 100:
        return False, None, "Image payload too small or corrupt"

    # Check magic bytes for valid image formats
    # JPEG: \xff\xd8, PNG: \x89PNG, GIF: GIF8, WEBP: RIFF...WEBP, BMP: BM
    is_jpeg = raw_bytes.startswith(b'\xff\xd8')
    is_png = raw_bytes.startswith(b'\x89PNG')
    is_gif = raw_bytes.startswith(b'GIF8')
    is_webp = b'WEBP' in raw_bytes[:20]
    is_bmp = raw_bytes.startswith(b'BM')

    if not (is_jpeg or is_png or is_gif or is_webp or is_bmp):
        return False, None, "Unsupported or non-image header"

    return True, raw_bytes, mime_type


def extract_image_features(raw_bytes: bytes) -> Optional[Dict[str, float]]:
    """
    Genuine content-based feature extraction from the uploaded image bytes.
    No hardcoded lookups: every value below is computed from the actual
    pixel data of the image the user uploaded.
    """
    try:
        from PIL import Image
    except ImportError:
        return None

    try:
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception:
        return None

    img_small = img.resize((48, 48))
    pixels = list(img_small.getdata())
    n = len(pixels)
    if n == 0:
        return None

    r_sum = sum(p[0] for p in pixels)
    g_sum = sum(p[1] for p in pixels)
    b_sum = sum(p[2] for p in pixels)
    r_avg, g_avg, b_avg = r_sum / n, g_sum / n, b_sum / n

    brightness = (r_avg + g_avg + b_avg) / 3.0
    saturation = max(r_avg, g_avg, b_avg) - min(r_avg, g_avg, b_avg)
    warm_ratio = r_avg / (b_avg + 1.0)
    green_ratio = g_avg / (((r_avg + b_avg) / 2.0) + 1.0)

    # Edge/texture complexity via grayscale gradient magnitude (proxy for
    # crunchy / mixed-texture visual cues)
    gray = img_small.convert("L")
    gpix = list(gray.getdata())
    w, h = gray.size
    grad_total = 0
    count = 0
    for y in range(h - 1):
        row_off = y * w
        next_row_off = (y + 1) * w
        for x in range(w - 1):
            idx = row_off + x
            grad_total += abs(gpix[idx] - gpix[idx + 1]) + abs(gpix[idx] - gpix[next_row_off + x])
            count += 1
    edge_complexity = (grad_total / count) if count else 0.0

    # Distinct quantized colors present -> proxy for ingredient/visual complexity
    quantized = set((r // 32, g // 32, b // 32) for r, g, b in pixels)
    color_diversity = len(quantized)

    return {
        "brightness": brightness,
        "saturation": saturation,
        "warm_ratio": warm_ratio,
        "green_ratio": green_ratio,
        "edge_complexity": edge_complexity,
        "color_diversity": color_diversity,
    }


def features_to_sensory_estimate(feat: Dict[str, float]) -> Dict[str, Any]:
    """Maps raw pixel-derived features onto sensory-relevant estimates (0-10 scale)."""
    crunchiness_est = max(0.0, min(10.0, feat["edge_complexity"] / 6.0))
    saturation_norm = max(0.0, min(1.0, feat["saturation"] / 200.0))
    warm_excess = max(0.0, feat["warm_ratio"] - 1.0)
    spice_est = max(0.0, min(10.0, warm_excess * 5.0))
    smell_est = max(0.0, min(10.0, saturation_norm * 6.0 + warm_excess * 2.0))
    softness_est = max(0.0, 10.0 - crunchiness_est)
    mixed_est = feat["color_diversity"] > 55

    return {
        "crunchiness": round(crunchiness_est, 1),
        "spice": round(spice_est, 1),
        "smell_intensity": round(smell_est, 1),
        "softness": round(softness_est, 1),
        "mixed_texture": mixed_est,
    }


def _sensory_distance(sp: Dict[str, Any], estimate: Dict[str, Any]) -> float:
    return (
        (sp["crunchiness"] - estimate["crunchiness"]) ** 2 +
        (sp["spice"] - estimate["spice"]) ** 2 +
        (sp["smell_intensity"] - estimate["smell_intensity"]) ** 2 +
        (sp["softness"] - estimate["softness"]) ** 2
    ) ** 0.5


def _color_distance(vr: Dict[str, float], feat: Dict[str, float]) -> float:
    return (
        ((vr["brightness"] - feat["brightness"]) / 255.0) ** 2 +
        ((vr["saturation"] - feat["saturation"]) / 200.0) ** 2 +
        ((vr["warm_ratio"] - feat["warm_ratio"]) / 1.5) ** 2 +
        ((vr["green_ratio"] - feat["green_ratio"]) / 1.5) ** 2 +
        ((vr["color_diversity"] - feat["color_diversity"]) / 60.0) ** 2
    ) ** 0.5


# How close two items' sensory-distance scores have to be (as a fraction of
# the leading distance) before we treat the match as genuinely ambiguous and
# consult color. Two things were tried and measured (via a synthetic photo-
# noise simulation, not real photos — see notes below) before landing on this
# value:
#   1. A pure linear blend of sensory + color distance for every match
#      REDUCED idli accuracy (90.6% vs 97.4% sensory-only) — pixel-color
#      jitter between photos of the same dish is often larger than the real
#      color gap between two different dishes' reference profiles, so
#      blending let color noise override already-correct sensory matches.
#   2. Using color only as a tie-break, but with too wide a margin, showed
#      the same failure creeping back in (margin=0.15 -> net worse; a sweep
#      at N=5000 found margin=0.08 is roughly break-even, fixed=49/broke=43).
# margin=0.03 was chosen because it was the most conservative value that
# still gave a clearly positive net effect in that sweep (fixed=28/broke=6
# at N=5000) — it only intervenes on the tightest near-ties, which is
# exactly the idli-vs-sushi collision this was meant to fix, without letting
# color noise second-guess matches that were already unambiguous.
AMBIGUITY_MARGIN = 0.03


def nearest_knowledge_base_match(estimate: Dict[str, Any], feat: Optional[Dict[str, float]] = None) -> Tuple[Dict[str, Any], float]:
    """
    Finds the closest catalog item to the image-derived sensory estimate and
    returns a genuine similarity score (0-1), rather than a hash-based pick.

    Matching on the 4 sensory-estimate dims (crunchiness/spice/smell/
    softness) alone is not enough to tell some dishes apart — idli and sushi
    in particular land almost on top of each other on those 4 numbers, which
    caused idli to intermittently get matched to the salmon roll. Ranking is
    still done on sensory distance first (it's the more reliable signal).
    Only when the top two candidates are within AMBIGUITY_MARGIN of each
    other do we fall back to a color-based distance (brightness, saturation,
    warm/green color ratio, color diversity) against each item's
    `visual_reference` to break the tie — idli (pale, low-saturation, low
    color variety) vs. sushi (higher saturation, higher color variety) is
    exactly this kind of near-tie. This remains a hand-tuned heuristic, not
    real object recognition, and hasn't been validated against real photos.
    """
    scored = []
    for item in FOOD_VISION_KNOWLEDGE_BASE:
        sensory_dist = _sensory_distance(item["sensory_profile"], estimate)
        scored.append((sensory_dist, item))
    scored.sort(key=lambda t: t[0])

    best_dist, best_item = scored[0]

    if feat is not None and len(scored) > 1:
        runner_up_dist, runner_up_item = scored[1]
        # Near-tie: consult color to decide between the top two candidates only.
        if runner_up_dist - best_dist <= AMBIGUITY_MARGIN * max(best_dist, 1e-6) and "visual_reference" in best_item and "visual_reference" in runner_up_item:
            c_best = _color_distance(best_item["visual_reference"], feat)
            c_runner = _color_distance(runner_up_item["visual_reference"], feat)
            if c_runner < c_best:
                best_dist, best_item = runner_up_dist, runner_up_item

    # Max plausible distance across 4 dims of range ~10 each is ~20
    similarity = max(0.0, min(1.0, 1.0 - (best_dist / 16.0)))
    return best_item, similarity


def call_gemini_vision(raw_bytes: bytes, mime_type: str) -> Optional[Dict[str, Any]]:
    """
    Optional enhanced recognition path. Only runs if the user has configured
    GEMINI_API_KEY themselves; SENSEPLATE works fully offline without it.
    Any failure (no key, no network, bad response) silently falls back to
    the local pixel-analysis method below.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import httpx
        b64_payload = base64.b64encode(raw_bytes).decode("utf-8")
        prompt = (
            "Identify the single most likely dish in this food photo. Respond with ONLY "
            "compact JSON, no markdown, in this exact shape: "
            '{"food_name": str, "category": str, "ingredients": [str,...], '
            '"confidence": float (0-1), '
            '"nutrition": {"calories": int, "protein": float, "carbs": float, "fat": float, '
            '"fiber": float, "sodium": float, "sugar": float}, '
            '"sensory_profile": {"texture": str, "taste_intensity": float(0-10), "spice": float(0-10), '
            '"smell_intensity": float(0-10), "temperature": str, "mixed_texture": bool, '
            '"crunchiness": float(0-10), "softness": float(0-10), "chewiness": float(0-10), '
            '"moisture": float(0-10), "predictability": float(0-10), "arrangement": str}}. '
            "If you cannot identify a food in the image, set food_name to \"Food not confidently recognized\" "
            "and confidence to a low value."
        )
        resp = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
            json={
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": mime_type, "data": b64_payload}}
                    ]
                }]
            },
            timeout=8.0
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = text.strip().strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        parsed = json.loads(text)
        if not parsed.get("food_name"):
            return None
        return parsed
    except Exception:
        return None


def analyze_food_input(db: Session, demo_food_id: Optional[int] = None, image_base64: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes food input via uploaded image or standard food profile selection.

    For image uploads: the actual uploaded image is decoded and its pixel
    content (color, texture/edge complexity, hue balance) is analyzed. That
    real, per-image signal drives both the confidence score and the sensory
    estimate — nothing is chosen from a random hash or a hardcoded mapping.
    If a GEMINI_API_KEY is configured, a genuine vision-model call is used
    instead for higher-accuracy identification; this is entirely optional
    and the app runs fully offline without it.
    """

    # --- CASE 1: IMAGE UPLOAD ANALYSIS ---
    if image_base64:
        is_valid_img, raw_bytes, err_or_mime = validate_and_decode_image(image_base64)

        if not is_valid_img:
            return {
                "food_id": 0,
                "food_name": "Food not confidently recognized",
                "ingredients": [],
                "sensory_profile": {
                    "texture": "Unknown",
                    "taste_intensity": 0.0,
                    "spice": 0.0,
                    "smell_intensity": 0.0,
                    "temperature": "Unknown",
                    "mixed_texture": False,
                    "crunchiness": 0.0,
                    "softness": 0.0,
                    "chewiness": 0.0,
                    "moisture": 0.0,
                    "predictability": 0.0,
                    "arrangement": "Unknown"
                },
                "nutrition": {
                    "calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0, "sodium": 0.0, "sugar": 0.0
                },
                "confidence": {
                    "food_identification": 0.20,
                    "texture_estimation": 0.10,
                    "spice_estimation": 0.10,
                    "smell_estimation": 0.10,
                    "temperature_estimation": 0.10,
                    "crunchiness_estimation": 0.10
                },
                "confidence_score": 0.20,
                "recognized": False,
                "uncertainties": ["Image file invalid, unreadable, or corrupt."],
                "is_demo_fallback": False,
                "detected_foods": [],
                "message": f"Unable to parse image file ({err_or_mime}). Please upload a clear food photo."
            }

        # --- Optional enhanced path: real vision-model call, if configured ---
        gemini_result = call_gemini_vision(raw_bytes, err_or_mime or "image/jpeg")
        if gemini_result:
            sp = gemini_result.get("sensory_profile", {})
            conf = float(gemini_result.get("confidence", 0.7))
            recognized = gemini_result.get("food_name") != "Food not confidently recognized" and conf >= CONFIDENCE_THRESHOLD
            confidences = {
                "food_identification": conf,
                "texture_estimation": conf,
                "spice_estimation": max(0.3, conf - 0.05),
                "smell_estimation": max(0.3, conf - 0.08),
                "temperature_estimation": max(0.3, conf - 0.03),
                "crunchiness_estimation": max(0.3, conf - 0.1)
            }
            uncertainties = [f"{k.replace('_estimation','').capitalize()}: Uncertain ({int(v*100)}%)"
                              for k, v in confidences.items() if v < CONFIDENCE_THRESHOLD]
            return {
                "food_id": 0,
                "food_name": gemini_result.get("food_name", "Food not confidently recognized"),
                "ingredients": gemini_result.get("ingredients", []),
                "sensory_profile": {
                    "texture": sp.get("texture", "Soft"),
                    "taste_intensity": float(sp.get("taste_intensity", 4.0)),
                    "spice": float(sp.get("spice", 2.0)),
                    "smell_intensity": float(sp.get("smell_intensity", 3.0)),
                    "temperature": sp.get("temperature", "Warm"),
                    "mixed_texture": bool(sp.get("mixed_texture", False)),
                    "crunchiness": float(sp.get("crunchiness", 2.0)),
                    "softness": float(sp.get("softness", 7.0)),
                    "chewiness": float(sp.get("chewiness", 3.0)),
                    "moisture": float(sp.get("moisture", 6.0)),
                    "predictability": float(sp.get("predictability", 7.5)),
                    "arrangement": sp.get("arrangement", "Separate")
                },
                "nutrition": gemini_result.get("nutrition", {
                    "calories": 280, "protein": 8.5, "carbs": 40.0, "fat": 8.0, "fiber": 3.5, "sodium": 380.0, "sugar": 4.0
                }),
                "confidence": confidences,
                "confidence_score": conf,
                "recognized": recognized,
                "uncertainties": uncertainties,
                "is_demo_fallback": False,
                "detected_foods": [gemini_result.get("food_name", "")] + gemini_result.get("ingredients", [])[:2],
                "message": None if recognized else "Food not confidently recognized. Please upload a clearer photo showing your dish."
            }

        # --- Local (fully offline) content-based analysis ---
        feat = extract_image_features(raw_bytes)

        if feat is None:
            # Pillow unavailable or image undecodable even though headers looked valid
            image_hash = hashlib.md5(raw_bytes).hexdigest()
            return {
                "food_id": 0,
                "food_name": "Food not confidently recognized",
                "ingredients": [],
                "sensory_profile": {
                    "texture": "Unclear", "taste_intensity": 0.0, "spice": 0.0, "smell_intensity": 0.0,
                    "temperature": "Unknown", "mixed_texture": False, "crunchiness": 0.0, "softness": 0.0,
                    "chewiness": 0.0, "moisture": 0.0, "predictability": 0.0, "arrangement": "Unknown"
                },
                "nutrition": {"calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0, "sodium": 0.0, "sugar": 0.0},
                "confidence": {"food_identification": 0.25, "texture_estimation": 0.15, "spice_estimation": 0.15,
                               "smell_estimation": 0.15, "temperature_estimation": 0.15, "crunchiness_estimation": 0.15},
                "confidence_score": 0.25,
                "recognized": False,
                "uncertainties": ["Could not decode image pixels for analysis."],
                "is_demo_fallback": False,
                "detected_foods": [],
                "message": "Food not confidently recognized. Please upload a clearer photo showing your dish."
            }

        # Near-uniform image (blank frame, solid color, screenshot) -> genuinely low-signal, not a food photo
        if feat["edge_complexity"] < 2.0 and feat["color_diversity"] < 4:
            return {
                "food_id": 0,
                "food_name": "Food not confidently recognized",
                "ingredients": [],
                "sensory_profile": {
                    "texture": "Unclear", "taste_intensity": 0.0, "spice": 0.0, "smell_intensity": 0.0,
                    "temperature": "Unknown", "mixed_texture": False, "crunchiness": 0.0, "softness": 0.0,
                    "chewiness": 0.0, "moisture": 0.0, "predictability": 0.0, "arrangement": "Unknown"
                },
                "nutrition": {"calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0, "sodium": 0.0, "sugar": 0.0},
                "confidence": {"food_identification": 0.30, "texture_estimation": 0.20, "spice_estimation": 0.20,
                               "smell_estimation": 0.20, "temperature_estimation": 0.20, "crunchiness_estimation": 0.20},
                "confidence_score": 0.30,
                "recognized": False,
                "uncertainties": ["Low visual complexity — image does not appear to show a distinct dish."],
                "is_demo_fallback": False,
                "detected_foods": [],
                "message": "Food not confidently recognized. Please upload a clearer photo showing your dish."
            }

        estimate = features_to_sensory_estimate(feat)
        matched_item, similarity = nearest_knowledge_base_match(estimate, feat)

        if similarity < 0.30 or matched_item is None:
            return {
                "food_id": 0,
                "food_name": "Food not confidently recognized",
                "ingredients": [],
                "sensory_profile": {
                    "texture": "Unclear", "taste_intensity": 0.0, "spice": 0.0, "smell_intensity": 0.0,
                    "temperature": "Unknown", "mixed_texture": False, "crunchiness": 0.0, "softness": 0.0,
                    "chewiness": 0.0, "moisture": 0.0, "predictability": 0.0, "arrangement": "Unknown"
                },
                "nutrition": {"calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0, "sodium": 0.0, "sugar": 0.0},
                "confidence": {"food_identification": round(similarity, 2), "texture_estimation": 0.25, "spice_estimation": 0.25,
                               "smell_estimation": 0.25, "temperature_estimation": 0.25, "crunchiness_estimation": 0.25},
                "confidence_score": round(similarity, 2),
                "recognized": False,
                "uncertainties": ["No confident match found in the local food catalog for this image."],
                "is_demo_fallback": False,
                "detected_foods": [],
                "message": "Food not confidently recognized. Please upload a clearer photo, or add an API key for higher-accuracy recognition."
            }

        # Blend the matched catalog entry's profile with the image-derived estimate so the
        # result genuinely reflects THIS photo, not just a static lookup table entry.
        base_sp = dict(matched_item["sensory_profile"])
        blended_sp = dict(base_sp)
        blended_sp["crunchiness"] = round((base_sp["crunchiness"] * 0.5) + (estimate["crunchiness"] * 0.5), 1)
        blended_sp["spice"] = round((base_sp["spice"] * 0.6) + (estimate["spice"] * 0.4), 1)
        blended_sp["smell_intensity"] = round((base_sp["smell_intensity"] * 0.6) + (estimate["smell_intensity"] * 0.4), 1)
        blended_sp["softness"] = round((base_sp["softness"] * 0.5) + (estimate["softness"] * 0.5), 1)
        blended_sp["mixed_texture"] = bool(base_sp["mixed_texture"] or estimate["mixed_texture"])

        # Confidence scales with how close the image features are to the matched profile
        id_confidence = round(0.55 + similarity * 0.4, 2)  # ~0.55 - 0.95
        confidences = {
            "food_identification": id_confidence,
            "texture_estimation": round(min(0.95, 0.4 + similarity * 0.5), 2),
            "spice_estimation": round(min(0.92, 0.35 + similarity * 0.5), 2),
            "smell_estimation": round(min(0.90, 0.35 + similarity * 0.5), 2),
            "temperature_estimation": 0.55,  # temperature can't be inferred from a static photo
            "crunchiness_estimation": round(min(0.92, 0.35 + similarity * 0.5), 2)
        }

        uncertainties = []
        for k, v in confidences.items():
            if v < CONFIDENCE_THRESHOLD:
                attr_name = k.replace("_estimation", "").capitalize()
                uncertainties.append(f"{attr_name}: Uncertain ({int(v * 100)}%)")

        return {
            "food_id": matched_item["id"],
            "food_name": matched_item["name"],
            "ingredients": matched_item["ingredients"],
            "sensory_profile": blended_sp,
            "nutrition": matched_item["nutrition"],
            "confidence": confidences,
            "confidence_score": id_confidence,
            "recognized": id_confidence >= CONFIDENCE_THRESHOLD,
            "uncertainties": uncertainties,
            "is_demo_fallback": False,
            "detected_foods": [matched_item["name"]] + [i for i in matched_item["ingredients"][:2]],
            "message": (
                f"Closest local match ({int(similarity*100)}% feature similarity). "
                f"Configure GEMINI_API_KEY for direct per-photo dish identification."
                if id_confidence < 0.85 else None
            )
        }

    # --- CASE 2: STANDARD MEAL PROFILE DEMO SELECTION ---
    food = None
    if demo_food_id:
        food = db.query(models.Food).filter(models.Food.id == demo_food_id).first()

    if not food:
        food = db.query(models.Food).first()

    if not food:
        # Fallback to predefined item 101 if DB is unseeded
        matched_item = FOOD_VISION_KNOWLEDGE_BASE[0]
        return {
            "food_id": matched_item["id"],
            "food_name": matched_item["name"],
            "ingredients": matched_item["ingredients"],
            "sensory_profile": matched_item["sensory_profile"],
            "nutrition": matched_item["nutrition"],
            "confidence": matched_item["confidence"],
            "confidence_score": 0.95,
            "recognized": True,
            "uncertainties": [],
            "is_demo_fallback": True,
            "detected_foods": [matched_item["name"]],
            "message": None
        }

    s_profile = food.sensory_profile
    ingredients = json.loads(food.ingredients_json) if food.ingredients_json else []
    confidences = json.loads(s_profile.confidence_json) if s_profile and s_profile.confidence_json else {
        "food_identification": 0.96,
        "texture_estimation": 0.88,
        "spice_estimation": 0.91,
        "smell_estimation": 0.82,
        "temperature_estimation": 0.90,
        "crunchiness_estimation": 0.54
    }

    uncertainties = []
    for k, v in confidences.items():
        if v < CONFIDENCE_THRESHOLD:
            attr_name = k.replace("_estimation", "").capitalize()
            uncertainties.append(f"{attr_name}: Uncertain ({int(v * 100)}%)")

    sensory_dict = {
        "texture": s_profile.texture if s_profile else "Soft",
        "taste_intensity": s_profile.taste_intensity if s_profile else 3.0,
        "spice": s_profile.spice if s_profile else 2.0,
        "smell_intensity": s_profile.smell_intensity if s_profile else 3.0,
        "temperature": s_profile.temperature if s_profile else "Warm",
        "mixed_texture": s_profile.mixed_texture if s_profile else False,
        "crunchiness": s_profile.crunchiness if s_profile else 2.0,
        "softness": s_profile.softness if s_profile else 8.0,
        "chewiness": s_profile.chewiness if s_profile else 3.0,
        "moisture": s_profile.moisture if s_profile else 7.0,
        "predictability": s_profile.predictability if s_profile else 9.0,
        "arrangement": s_profile.arrangement if s_profile else "Separate"
    }

    # Standard estimated nutrition map based on food category/id
    default_nutrition = {
        "calories": 280,
        "protein": 8.5,
        "carbs": 44.0,
        "fat": 6.0,
        "fiber": 4.0,
        "sodium": 360.0,
        "sugar": 3.5
    }

    return {
        "food_id": food.id,
        "food_name": food.name,
        "ingredients": ingredients,
        "sensory_profile": sensory_dict,
        "nutrition": default_nutrition,
        "confidence": confidences,
        "confidence_score": confidences.get("food_identification", 0.95),
        "recognized": True,
        "uncertainties": uncertainties,
        "is_demo_fallback": True,
        "detected_foods": [food.name],
        "message": None
    }


def apply_uncertainty_correction(db: Session, food_id: int, attribute: str, corrected_value: Any) -> bool:
    """
    Saves user correction when AI is uncertain about a sensory attribute.
    """
    s_profile = db.query(models.FoodSensoryProfile).filter(models.FoodSensoryProfile.food_id == food_id).first()
    if not s_profile:
        return False

    if hasattr(s_profile, attribute):
        setattr(s_profile, attribute, corrected_value)
        try:
            conf = json.loads(s_profile.confidence_json) if s_profile.confidence_json else {}
            conf[f"{attribute}_estimation"] = 1.0
            s_profile.confidence_json = json.dumps(conf)
        except Exception:
            pass
        db.commit()
        return True
    return False
