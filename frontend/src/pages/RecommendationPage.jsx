import React, { useState, useEffect } from 'react';
import { Sliders, ThumbsUp, ThumbsDown, Sparkles, AlertTriangle, RefreshCw, Wand2, ArrowRight, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { api } from '../services/api';
import CompatibilityRing from '../components/CompatibilityRing';
import ExplainableBadge from '../components/ExplainableBadge';

export default function RecommendationPage({ onSelectMeal, easyMode }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adaptations, setAdaptations] = useState({});   // food_id -> adaptation result
  const [adaptingId, setAdaptingId] = useState(null);
  const [expandedWhy, setExpandedWhy] = useState({});    // food_id -> bool

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.recommend(1);
      setRecommendations(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleAdapt = async (foodId) => {
    setAdaptingId(foodId);
    const result = await api.adaptMeal(foodId, 1);
    setAdaptations(prev => ({ ...prev, [foodId]: result }));
    setAdaptingId(null);
  };

  const toggleWhy = (foodId) => {
    setExpandedWhy(prev => ({ ...prev, [foodId]: !prev[foodId] }));
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 border border-stone-200 shadow-sm">
        <RefreshCw className="w-10 h-10 text-teal-600 mx-auto animate-spin" />
        <h3 className="text-xl font-bold text-slate-900">Running Sensory Matching Engine...</h3>
        <p className="text-xs text-slate-500">Comparing sensory profiles, weights, and avoid parameters</p>
      </div>
    );
  }

  const best = recommendations?.best_matches || [];
  const less = recommendations?.less_suitable || [];

  return (
    <div className={`max-w-5xl mx-auto space-y-8 ${easyMode ? 'easy-mode' : ''}`}>
      
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-teal-700 font-bold">
            <Sliders className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-extrabold text-slate-900">Sensory Recommendations</h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
            Personalized Matching
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {recommendations?.personalization_notice || "Matching generated using your personalized sensory preferences."}
        </p>
      </div>

      {/* BEST MATCHES */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-teal-800 font-extrabold text-lg">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3>YOUR BEST MATCHES</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {best.map((item, idx) => (
            <div key={item.food_id} className="bg-white p-6 rounded-2xl border border-stone-200 glass-card-hover space-y-4 shadow-sm">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-start space-x-4">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-800 font-black flex items-center justify-center border border-teal-200 shrink-0 text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900">{item.food_name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingredients: {item.ingredients.join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <CompatibilityRing score={item.compatibility_score} size={80} strokeWidth={7} />
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => onSelectMeal(item.food_id, item.food_name, 'loved')}
                      className="px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm flex items-center space-x-1.5 text-xs"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Choose This Meal</span>
                    </button>

                    <button
                      onClick={() => onSelectMeal(item.food_id, item.food_name, 'didnt_work')}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center space-x-1.5"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Not Suitable</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Explainable AI breakdown */}
              <div className="pt-3 border-t border-stone-200">
                <ExplainableBadge items={item.explanations} />
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* LESS SUITABLE */}
      {less.length > 0 && !easyMode && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3>LESS SUITABLE MEALS</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {less.map((item) => {
              const adapted = adaptations[item.food_id];
              const bestAlternative = best[0];
              const showWhy = !!expandedWhy[item.food_id];

              return (
                <div key={item.food_id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-base">{item.food_name}</h4>
                    <span className="font-mono font-bold text-amber-800 text-sm">
                      {Math.round(item.compatibility_score)}% match
                    </span>
                  </div>

                  <p className="text-xs text-amber-900 font-medium">
                    Low match because this meal contains characteristics you marked as avoid or dislike.
                  </p>

                  <ExplainableBadge items={item.explanations} />

                  {/* FEATURE 2 — Food Adaptation Engine */}
                  <div className="pt-2 border-t border-stone-100 space-y-3">
                    {!adapted ? (
                      <button
                        onClick={() => handleAdapt(item.food_id)}
                        disabled={adaptingId === item.food_id}
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        {adaptingId === item.food_id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        <span>{adaptingId === item.food_id ? 'Adapting meal…' : 'Adapt This Meal'}</span>
                      </button>
                    ) : (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Suggested Adaptations</p>
                        <ul className="space-y-1.5">
                          {adapted.adaptations.map((a, idx) => (
                            <li key={idx} className="text-xs font-semibold text-slate-800 flex items-start space-x-1.5">
                              <span className="text-teal-600 mt-0.5">•</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-center space-x-4 pt-2 border-t border-teal-100">
                          <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-slate-500">Before</p>
                            <p className="text-xl font-black text-amber-700 font-mono">{Math.round(adapted.before_score)}%</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-teal-500" />
                          <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-slate-500">After Adaptation</p>
                            <p className="text-xl font-black text-teal-700 font-mono">{Math.round(adapted.after_score)}%</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 italic text-center">{adapted.disclaimer}</p>
                      </div>
                    )}

                    {/* FEATURE 7 — Personalized Alternative */}
                    {bestAlternative && (
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-700">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Better Option For You</span>
                          </div>
                          <button
                            onClick={() => toggleWhy(item.food_id)}
                            className="text-[11px] font-bold text-teal-700 flex items-center space-x-1 hover:text-teal-900"
                          >
                            <span>View Why</span>
                            {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="text-slate-500">Current meal</p>
                            <p className="font-bold text-slate-800">{item.food_name} — {Math.round(item.compatibility_score)}%</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <div className="text-right">
                            <p className="text-slate-500">Alternative</p>
                            <p className="font-bold text-teal-700">{bestAlternative.food_name} — {Math.round(bestAlternative.compatibility_score)}%</p>
                          </div>
                        </div>
                        {showWhy && (
                          <div className="pt-2 border-t border-stone-200">
                            <ExplainableBadge items={bestAlternative.explanations} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onSelectMeal(item.food_id, item.food_name, 'didnt_work')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-stone-100 border border-stone-200"
                    >
                      Select Feedback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
