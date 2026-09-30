from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, default="default_user")
    created_at = Column(DateTime, default=datetime.utcnow)

    sensory_profile = relationship("SensoryProfile", back_populates="user", uselist=False)
    recommendations = relationship("Recommendation", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")

class SensoryProfile(Base):
    __tablename__ = "sensory_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    texture = Column(String(50), default="Soft")
    taste = Column(String(50), default="Mild")
    spice = Column(String(50), default="Mild")
    smell = Column(String(50), default="Low")
    temperature = Column(String(50), default="Warm")
    food_arrangement = Column(String(50), default="Separate")
    predictability = Column(String(50), default="Familiar foods preferred")
    
    # Preferences dictionary stored as JSON string: {"texture": "Preferred", "spice": "Avoid", ...}
    preferences_json = Column(Text, default="{}")
    # Learned/custom weights for matching formula
    weights_json = Column(Text, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sensory_profile")

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    category = Column(String(50), default="General")
    description = Column(Text, default="")
    ingredients_json = Column(Text, default="[]")
    image_url = Column(String(255), default="")

    sensory_profile = relationship("FoodSensoryProfile", back_populates="food", uselist=False)

class FoodSensoryProfile(Base):
    __tablename__ = "food_sensory_profiles"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.id"), unique=True)
    texture = Column(String(50), default="Soft")
    taste_intensity = Column(Float, default=5.0)  # 0-10
    spice = Column(Float, default=3.0)            # 0-10
    smell_intensity = Column(Float, default=4.0)  # 0-10
    temperature = Column(String(50), default="Warm")
    mixed_texture = Column(Boolean, default=False)
    crunchiness = Column(Float, default=2.0)      # 0-10
    softness = Column(Float, default=8.0)         # 0-10
    chewiness = Column(Float, default=3.0)        # 0-10
    moisture = Column(Float, default=6.0)         # 0-10
    predictability = Column(Float, default=8.0)   # 0-10
    arrangement = Column(String(50), default="Separate")
    
    # Store AI confidences e.g. {"food_identification": 0.96, "texture_estimation": 0.82}
    confidence_json = Column(Text, default="{}")

    food = relationship("Food", back_populates="sensory_profile")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_id = Column(Integer, ForeignKey("foods.id"))
    compatibility_score = Column(Float)
    match_breakdown_json = Column(Text, default="{}")
    explanation_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    food = relationship("Food")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_id = Column(Integer, ForeignKey("foods.id"))
    rating = Column(String(20)) # loved, okay, didnt_work
    tags_json = Column(Text, default="[]")
    comments = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
    food = relationship("Food")

class CafeteriaMetrics(Base):
    __tablename__ = "cafeteria_metrics"

    id = Column(Integer, primary_key=True, index=True)
    total_analyzed = Column(Integer, default=247)
    accepted_count = Column(Integer, default=184)
    rejected_count = Column(Integer, default=63)
    acceptance_rate = Column(Float, default=74.5)
    estimated_waste_kg = Column(Float, default=11.0)
    updated_at = Column(DateTime, default=datetime.utcnow)
