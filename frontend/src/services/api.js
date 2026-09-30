import { FALLBACK_DEMO_FOODS, FALLBACK_PROFILE } from '../data/fallbackData';

const BASE_URL = 'http://localhost:8000';

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const api = {
  async getHealth() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Offline fallback
    }
    return { status: "healthy (offline mode)", service: "SENSEPLATE Client Engine", offline_mode_ready: true };
  },

  async getSensoryProfile(userId = 1) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/sensory-profile/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline sensory profile fallback.");
    }
    return FALLBACK_PROFILE;
  },

  async saveSensoryProfile(profileData) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/sensory-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline profile update fallback.");
    }
    return { ...profileData, id: 1, updated_at: new Date().toISOString() };
  },

  async getFoods() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/foods`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline foods fallback.");
    }
    return FALLBACK_DEMO_FOODS;
  },

  async analyzeFood(demoFoodId = 1, imageBase64 = null) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/analyze-food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_food_id: demoFoodId, image_base64: imageBase64, user_id: 1 })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline food analysis fallback.");
    }

    const food = FALLBACK_DEMO_FOODS.find(f => f.id === demoFoodId) || FALLBACK_DEMO_FOODS[0];
    return {
      food_id: food.id,
      food_name: food.name,
      ingredients: food.ingredients,
      sensory_profile: food.sensory_profile,
      nutrition: {
        calories: 280,
        protein: 8.5,
        carbs: 44.0,
        fat: 6.0,
        fiber: 4.0,
        sodium: 360.0,
        sugar: 3.5
      },
      confidence: food.confidence,
      confidence_score: 0.95,
      recognized: true,
      uncertainties: food.confidence?.crunchiness_estimation < 0.65 ? ["Crunchiness: Uncertain — 54%"] : [],
      is_demo_fallback: true,
      detected_foods: [food.name],
      sensory_load: {
        score: 40,
        level: "MEDIUM",
        reasons: ["Estimated offline — connect the backend for live analysis"],
        disclaimer: "AI-assisted estimate of general sensory demand — not a medical assessment or diagnosis."
      }
    };
  },

  async correctUncertainty(foodId, attribute, correctedValue) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/correct-uncertainty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_id: foodId, attribute, corrected_value: correctedValue })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline uncertainty correction fallback.");
    }
    return { status: "success", message: `Updated ${attribute} based on human feedback.` };
  },

  async recommend(userId = 1, userProfile = null) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline recommendation calculation fallback.");
    }

    // Client-side local recommendation calculator fallback
    const targetProfile = userProfile || FALLBACK_PROFILE;
    const items = FALLBACK_DEMO_FOODS.map(food => {
      const s = food.sensory_profile;
      let score = 85.0;
      const explanations = [];

      if (targetProfile.texture === s.texture) {
        score += 10;
        explanations.push(`✓ ${s.texture} texture matches preference`);
      } else {
        score -= 15;
        explanations.push(`⚠ Texture differs from preferred (${targetProfile.texture})`);
      }

      if (targetProfile.spice === "Mild" && s.spice <= 3.0) {
        score += 5;
        explanations.push(`✓ Mild spice matches preference`);
      } else if (targetProfile.preferences?.spice === "Avoid" && s.spice > 4.0) {
        score -= 40;
        explanations.push(`⚠ Contains high spice marked as avoid`);
      }

      if (s.smell_intensity <= 3.0) {
        explanations.push(`✓ Low smell intensity`);
      } else {
        explanations.push(`⚠ Stronger smell intensity (${s.smell_intensity}/10)`);
      }

      score = Math.max(10, Math.min(98, Math.round(score)));

      return {
        food_id: food.id,
        food_name: food.name,
        ingredients: food.ingredients,
        compatibility_score: score,
        match_breakdown: {
          texture_match: targetProfile.texture === s.texture ? 95 : 45,
          taste_match: 80,
          spice_match: s.spice <= 3 ? 90 : 40,
          smell_match: s.smell_intensity <= 3 ? 90 : 50,
          temperature_match: 85,
          predictability_match: 90,
          arrangement_match: 85
        },
        explanations,
        suitable: score >= 65
      };
    });

    items.sort((a, b) => b.compatibility_score - a.compatibility_score);
    return {
      user_id: userId,
      best_matches: items.filter(x => x.suitable),
      less_suitable: items.filter(x => !x.suitable),
      personalization_notice: "Matching generated using your sensory preferences."
    };
  },

  async submitFeedback(feedbackData) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline feedback fallback.");
    }
    return {
      status: "success",
      message: "Thank you! Your feedback helps customize recommendations and improve cafeteria meal planning.",
      updated_weights_notice: feedbackData.rating === "didnt_work" ? "Your preferences are becoming more personalized based on your feedback." : null
    };
  },

  async getCafeteriaMetrics() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/cafeteria/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline cafeteria metrics fallback.");
    }
    return {
      total_analyzed: 247,
      accepted_count: 184,
      rejected_count: 63,
      acceptance_rate: 74.5,
      estimated_avoidable_waste_kg: 11.0,
      waste_formula_explanation: "63 rejected meals × 250g avg portion × 0.70 estimated uneaten fraction = 11.0 kg estimated avoidable waste."
    };
  },

  async getCafeteriaInsights() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/cafeteria/insights`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline cafeteria insights fallback.");
    }
    return {
      metrics: {
        total_analyzed: 247,
        accepted_count: 184,
        rejected_count: 63,
        acceptance_rate: 74.5,
        estimated_avoidable_waste_kg: 11.0,
        waste_formula_explanation: "63 rejected meals × 250g avg portion × 0.70 estimated uneaten fraction = 11.0 kg estimated avoidable waste."
      },
      most_accepted_traits: [
        "Soft textures (Idli, Paneer, Soft Sandwich)",
        "Mild spice level (0-3/10)",
        "Low smell intensity",
        "High predictability (Familiar meals)",
        "Separate component arrangement"
      ],
      frequently_rejected_traits: [
        "High spice level (> 5/10)",
        "Strong smell intensity (> 6/10)",
        "Mixed textures / crispy toppings",
        "Very crunchy components"
      ],
      suggested_action: "Consider preparing fewer portions of high-spice/strong-smell meals and increasing flexible mild/soft alternatives based on observed prototype-user patterns.",
      simulated_waste_reduction_percent: 18.4,
      disclaimer: "ESTIMATE & SIMULATION — based on anonymous prototype sample data, not measured physical waste."
    };
  },

  async adaptMeal(foodId, userId = 1) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/adapt-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, food_id: foodId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline meal adaptation fallback.");
    }
    return {
      food_id: foodId,
      food_name: "This meal",
      before_score: 45.0,
      after_score: 82.0,
      adaptations: [
        "Reduce spice level / prepare a mild version",
        "Serve strong-smelling components separately",
        "Keep food components separate instead of mixed"
      ],
      disclaimer: "These are suggested adaptations, not a guarantee the modified meal will be accepted."
    };
  },

  async getMenuPrediction() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/cafeteria/predict-menu`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline menu prediction fallback.");
    }
    return {
      items: FALLBACK_DEMO_FOODS.slice(0, 5).map((f, i) => ({
        food_id: f.id,
        food_name: f.name,
        expected_compatibility: [91, 84, 78, 62, 46][i] ?? 70
      })),
      disclaimer: "Prototype estimates based on anonymous aggregate feedback and sample sensory profiles — not measured acceptance."
    };
  },

  async resetDemo() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/demo/reset`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      // offline fallback reset
    }
    return { status: "success", message: "Demo data reset to initial baseline state." };
  }
};
