# SENSEPLATE

> **“We don't ask neurodivergent people to adapt to food. We make food environments adapt to them.”**

A sensory-aware food accessibility and waste-reduction system that maps food sensory profiles (texture, spice, smell, temperature, arrangement, predictability) to individual comfort preferences, provides explainable AI recommendations, and feeds anonymous user feedback into cafeteria sustainability dashboards.

---

## 🌟 Key Innovations

1. **Sensory Matching Engine**: Transparent 0–100% weighted scoring algorithm factoring in texture, taste, spice, smell, serving temperature, arrangement separation, and predictability index.
2. **Explainable AI Rationale**: Replaces black-box AI with clear visual indicators (`✓ Soft texture matches preference`, `⚠ High spice level marked as avoid`).
3. **Uncertainty Correction**: Visual flags for low-confidence AI sensory estimates with human-in-the-loop correction capabilities.
4. **Closed-Loop Sustainability**: Connects neurodivergent accessibility directly to cafeteria food waste reduction via transparent estimation formulas:
   $$\text{Estimated Waste} = \text{Rejected Meals} \times \text{Average Portion (250g)} \times \text{Waste Factor (0.70)}$$
5. **Cognitive Accessibility & Easy Mode**: One-click UI toggle to reduce visual clutter, increase contrast, and simplify decision pathways.
6. **100% Offline Resilience**: Runs locally on localhost without requiring internet or paid API keys.

---

## 🏗️ Architecture & Tech Stack

```
senseplate/
├── backend/
│   ├── main.py                # FastAPI app, endpoints & CORS
│   ├── database.py            # SQLite session configuration
│   ├── models.py              # SQLAlchemy DB schema
│   ├── schemas.py             # Pydantic data validation schemas
│   ├── sensory_engine.py      # Weighted matching math & learning loop
│   ├── food_analyzer.py       # Mock/Adapter AI vision layer & uncertainty detector
│   ├── recommendation.py     # Ranking generator & explainability builder
│   ├── seed.py                # Database seeder (10 demo food profiles)
│   ├── test_main.py           # Pytest test suite
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, SensoryBar, CompatibilityRing, ExplainableBadge, VisualTransition
│   │   ├── pages/             # Landing, Profile, Scanner, Recommendation, Feedback, Cafeteria, Demo
│   │   ├── services/          # API client with graceful offline fallback
│   │   ├── data/              # Fallback demo data
│   │   ├── App.jsx            # React root container & tab router
│   │   └── index.css          # Tailwind CSS & design tokens
│   ├── package.json
│   └── vite.config.js
├── README.md                  # System documentation
├── start.py                   # Universal launcher
├── run.bat                    # Windows startup script
└── run.sh                     # Unix startup script
```

### Stack Components:
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Pytest
- **Database**: SQLite (`senseplate.db`)
- **AI Model Layer**: Local adapter pattern (Offline mock AI + Llava/Ollama extension hook)

---

