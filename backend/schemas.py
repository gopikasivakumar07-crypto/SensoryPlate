from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str = "default_user"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SensoryProfileSchema(BaseModel):
    texture: str = "Soft"
    taste: str = "Mild"
    spice: str = "Mild"
    smell: str = "Low"
    temperature: str = "Warm"
    food_arrangement: str = "Separate"
    predictability: str = "Familiar foods preferred"
    # Mapping of trait -> "Preferred" | "Neutral" | "Avoid"
    preferences: Dict[str, str] = Field(default_factory=dict)
    weights: Optional[Dict[str, float]] = Field(default_factory=dict)

class SensoryProfileCreate(SensoryProfileSchema):
    user_id: int = 1

class SensoryProfileResponse(SensoryProfileSchema):
    id: int
    user_id: int
    updated_at: datetime
    class Config:
        from_attributes = True

class SensoryLoadSchema(BaseModel):
    score: int
    level: str  # LOW | MEDIUM | HIGH
    reasons: List[str]
    disclaimer: str = "AI-assisted estimate of general sensory demand — not a medical assessment or diagnosis."

class FoodSensoryProfileSchema(BaseModel):
    texture: str
    taste_intensity: float # 0-10
    spice: float          # 0-10
    smell_intensity: float# 0-10
    temperature: str
    mixed_texture: bool
    crunchiness: float    # 0-10
    softness: float       # 0-10
    chewiness: float      # 0-10
    moisture: float       # 0-10
    predictability: float # 0-10
    arrangement: str = "Separate"

class FoodSchema(BaseModel):
    id: int
    name: str
    category: str
    description: str
    ingredients: List[str]
    image_url: str
    sensory_profile: FoodSensoryProfileSchema
    sensory_load: Optional[SensoryLoadSchema] = None
    class Config:
        from_attributes = True

class NutritionSchema(BaseModel):
    calories: int = 250
    protein: float = 8.0
    carbs: float = 35.0
    fat: float = 6.0
    fiber: float = 3.5
    sodium: float = 320.0
    sugar: float = 4.0

class FoodAnalysisRequest(BaseModel):
    demo_food_id: Optional[int] = None
    image_base64: Optional[str] = None
    user_id: Optional[int] = 1

class UncertaintyCorrectionRequest(BaseModel):
    food_id: int
    attribute: str
    corrected_value: Any

class FoodAnalysisResponse(BaseModel):
    food_id: int
    food_name: str
    ingredients: List[str]
    sensory_profile: FoodSensoryProfileSchema
    nutrition: NutritionSchema
    confidence: Dict[str, float]
    confidence_score: float = 0.95
    recognized: bool = True
    uncertainties: List[str]
    is_demo_fallback: bool = False
    detected_foods: List[str] = Field(default_factory=list)
    message: Optional[str] = None
    sensory_load: Optional[SensoryLoadSchema] = None

class AdaptMealRequest(BaseModel):
    user_id: int = 1
    food_id: int

class AdaptMealResponse(BaseModel):
    food_id: int
    food_name: str
    before_score: float
    after_score: float
    adaptations: List[str]
    disclaimer: str

class MenuPredictionItem(BaseModel):
    food_id: int
    food_name: str
    expected_compatibility: float

class MenuPredictionResponse(BaseModel):
    items: List[MenuPredictionItem]
    disclaimer: str

class RecommendRequest(BaseModel):
    user_id: int = 1
    food_ids: Optional[List[int]] = None

class CompatibilityBreakdown(BaseModel):
    texture_match: float
    taste_match: float
    spice_match: float
    smell_match: float
    temperature_match: float
    predictability_match: float
    arrangement_match: float

class RecommendationItem(BaseModel):
    food_id: int
    food_name: str
    ingredients: List[str]
    compatibility_score: float # 0-100%
    match_breakdown: CompatibilityBreakdown
    explanations: List[str] # List of "✓ Soft texture matches preference", "⚠ High spice"
    suitable: bool

class RecommendationResponse(BaseModel):
    user_id: int
    best_matches: List[RecommendationItem]
    less_suitable: List[RecommendationItem]
    personalization_notice: str

class FeedbackRequest(BaseModel):
    user_id: int = 1
    food_id: int
    rating: str # "loved", "okay", "didnt_work"
    tags: List[str] = Field(default_factory=list) # e.g. ["Too spicy", "Too crunchy"]
    comments: Optional[str] = ""

class FeedbackResponse(BaseModel):
    status: str
    message: str
    updated_weights_notice: Optional[str] = None
    preference_insight: Optional[str] = None

class CafeteriaMetricsResponse(BaseModel):
    total_analyzed: int
    accepted_count: int
    rejected_count: int
    acceptance_rate: float
    estimated_avoidable_waste_kg: float
    waste_formula_explanation: str

class CafeteriaInsightsResponse(BaseModel):
    metrics: CafeteriaMetricsResponse
    most_accepted_traits: List[str]
    frequently_rejected_traits: List[str]
    suggested_action: str
    simulated_waste_reduction_percent: float
    disclaimer: str
