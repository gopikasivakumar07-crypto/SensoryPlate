export const FALLBACK_DEMO_FOODS = [
  {
    id: 1,
    name: "Idli with sambar",
    category: "South Indian",
    description: "Steamed rice cakes served with mild lentil stew and coconut chutney.",
    ingredients: ["Steamed Rice & Lentil Cake", "Mild Lentil Stew", "Coconut Chutney"],
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Soft",
      taste_intensity: 2.5,
      spice: 1.5,
      smell_intensity: 2.0,
      temperature: "Warm",
      mixed_texture: false,
      crunchiness: 1.0,
      softness: 9.2,
      chewiness: 2.0,
      moisture: 8.0,
      predictability: 9.5,
      arrangement: "Separate"
    },
    confidence: {
      food_identification: 0.98,
      texture_estimation: 0.94,
      spice_estimation: 0.92,
      smell_estimation: 0.89
    }
  },
  {
    id: 2,
    name: "Masala dosa",
    category: "South Indian",
    description: "Crispy fermented rice crepes filled with spiced potato masala.",
    ingredients: ["Crispy Rice Crepe", "Spiced Potato Masala", "Sambar", "Chutney"],
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Crispy",
      taste_intensity: 6.5,
      spice: 6.0,
      smell_intensity: 6.5,
      temperature: "Hot",
      mixed_texture: true,
      crunchiness: 8.5,
      softness: 4.0,
      chewiness: 3.0,
      moisture: 4.5,
      predictability: 8.0,
      arrangement: "Mixed"
    },
    confidence: {
      food_identification: 0.95,
      texture_estimation: 0.88,
      spice_estimation: 0.85,
      crunchiness_estimation: 0.54
    }
  },
  {
    id: 3,
    name: "Vegetable fried rice",
    category: "Asian",
    description: "Stir-fried long grain rice with diced crisp vegetables and mild soy sauce.",
    ingredients: ["Basmati Rice", "Carrots", "Peas", "Soy Sauce", "Mild Spices"],
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Mixed textures",
      taste_intensity: 4.5,
      spice: 3.0,
      smell_intensity: 4.8,
      temperature: "Warm",
      mixed_texture: true,
      crunchiness: 4.5,
      softness: 6.5,
      chewiness: 3.5,
      moisture: 5.5,
      predictability: 7.5,
      arrangement: "Mixed"
    },
    confidence: {
      food_identification: 0.96,
      texture_estimation: 0.82,
      spice_estimation: 0.91
    }
  },
  {
    id: 4,
    name: "Paneer curry with rice",
    category: "North Indian",
    description: "Soft cottage cheese cubes cooked in a mild tomato gravy with steamed rice.",
    ingredients: ["Paneer Cheese", "Tomato Gravy", "Steamed Basmati Rice"],
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Soft",
      taste_intensity: 4.0,
      spice: 2.5,
      smell_intensity: 3.5,
      temperature: "Warm",
      mixed_texture: false,
      crunchiness: 1.5,
      softness: 8.0,
      chewiness: 3.0,
      moisture: 7.5,
      predictability: 8.5,
      arrangement: "Separate"
    },
    confidence: {
      food_identification: 0.93,
      texture_estimation: 0.91,
      spice_estimation: 0.89
    }
  },
  {
    id: 5,
    name: "Margherita pizza",
    category: "Italian",
    description: "Classic baked pizza base with mozzarella cheese and tomato sauce.",
    ingredients: ["Pizza Dough", "Mozzarella Cheese", "Tomato Sauce"],
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Chewy",
      taste_intensity: 7.0,
      spice: 2.0,
      smell_intensity: 7.5,
      temperature: "Hot",
      mixed_texture: true,
      crunchiness: 5.5,
      softness: 5.0,
      chewiness: 7.5,
      moisture: 5.0,
      predictability: 9.0,
      arrangement: "Mixed"
    },
    confidence: {
      food_identification: 0.97,
      texture_estimation: 0.86,
      spice_estimation: 0.93
    }
  },
  {
    id: 6,
    name: "Classic veggie burger",
    category: "Fast Food",
    description: "Soft bun with a crispy veggie patty, lettuce, tomato, and mild sauce.",
    ingredients: ["Burger Bun", "Veggie Patty", "Lettuce", "Tomato Slice"],
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Mixed textures",
      taste_intensity: 6.0,
      spice: 3.5,
      smell_intensity: 6.0,
      temperature: "Warm",
      mixed_texture: true,
      crunchiness: 6.0,
      softness: 5.5,
      chewiness: 6.5,
      moisture: 5.0,
      predictability: 8.5,
      arrangement: "Mixed"
    },
    confidence: {
      food_identification: 0.95,
      texture_estimation: 0.83,
      spice_estimation: 0.88
    }
  },
  {
    id: 7,
    name: "Vegetable noodles",
    category: "Asian",
    description: "Soft stir-fried noodles with bell peppers and mild seasoning.",
    ingredients: ["Wheat Noodles", "Bell Peppers", "Carrots", "Mild Seasoning"],
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Chewy",
      taste_intensity: 4.0,
      spice: 2.0,
      smell_intensity: 4.0,
      temperature: "Warm",
      mixed_texture: false,
      crunchiness: 2.5,
      softness: 7.0,
      chewiness: 7.5,
      moisture: 6.5,
      predictability: 8.0,
      arrangement: "Separate"
    },
    confidence: {
      food_identification: 0.94,
      texture_estimation: 0.87,
      spice_estimation: 0.90
    }
  },
  {
    id: 8,
    name: "Fresh garden salad",
    category: "Salad",
    description: "Crisp cucumber, diced tomatoes, lettuce, and olive oil dressing.",
    ingredients: ["Cucumber", "Lettuce", "Cherry Tomatoes", "Olive Oil Dressing"],
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Crunchy",
      taste_intensity: 2.0,
      spice: 0.0,
      smell_intensity: 2.0,
      temperature: "Cold",
      mixed_texture: true,
      crunchiness: 9.0,
      softness: 2.0,
      chewiness: 2.0,
      moisture: 8.5,
      predictability: 8.5,
      arrangement: "Separate"
    },
    confidence: {
      food_identification: 0.96,
      texture_estimation: 0.92,
      spice_estimation: 0.98
    }
  },
  {
    id: 9,
    name: "Penne pasta with cream",
    category: "Italian",
    description: "Smooth penne pasta tossed in a velvety mild white sauce.",
    ingredients: ["Penne Pasta", "White Cream Sauce", "Parmesan"],
    image_url: "https://images.unsplash.com/photo-1621996346565-e3def6164286?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Smooth",
      taste_intensity: 3.0,
      spice: 1.0,
      smell_intensity: 2.5,
      temperature: "Warm",
      mixed_texture: false,
      crunchiness: 1.0,
      softness: 8.5,
      chewiness: 4.5,
      moisture: 7.5,
      predictability: 8.5,
      arrangement: "Separate"
    },
    confidence: {
      food_identification: 0.95,
      texture_estimation: 0.90,
      spice_estimation: 0.94
    }
  },
  {
    id: 10,
    name: "Soft veg sandwich",
    category: "Snacks",
    description: "Crustless soft bread with cucumber slices and butter spread.",
    ingredients: ["Soft White Bread", "Cucumber Slices", "Butter Spread"],
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
    sensory_profile: {
      texture: "Soft",
      taste_intensity: 2.0,
      spice: 0.0,
      smell_intensity: 1.5,
      temperature: "Room temperature",
      mixed_texture: false,
      crunchiness: 2.0,
      softness: 8.5,
      chewiness: 3.0,
      moisture: 6.5,
      predictability: 9.0,
      arrangement: "Separate"
    },
    confidence: {
      food_identification: 0.97,
      texture_estimation: 0.93,
      spice_estimation: 0.97
    }
  }
];

export const FALLBACK_PROFILE = {
  user_id: 1,
  texture: "Soft",
  taste: "Mild",
  spice: "Mild",
  smell: "Low",
  temperature: "Warm",
  food_arrangement: "Separate",
  predictability: "Familiar foods preferred",
  preferences: {
    texture: "Preferred",
    spice: "Avoid",
    smell: "Avoid",
    food_arrangement: "Preferred",
    predictability: "Preferred"
  }
};
