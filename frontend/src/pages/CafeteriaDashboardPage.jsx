import React, { useState, useEffect } from 'react';
import { BarChart3, Leaf, Recycle, ShieldCheck, CheckCircle2, AlertTriangle, Lightbulb, ThumbsUp, ThumbsDown, TrendingUp, ArrowDown } from 'lucide-react';
import { api } from '../services/api';

export default function CafeteriaDashboardPage({ easyMode }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuPrediction, setMenuPrediction] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [insightsData, menuData] = await Promise.all([
        api.getCafeteriaInsights(),
        api.getMenuPrediction()
      ]);
      setInsights(insightsData);
      setMenuPrediction(menuData);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 border border-stone-200 shadow-sm">
        <Recycle className="w-10 h-10 text-teal-600 mx-auto animate-spin" />
        <h3 className="text-xl font-bold text-slate-900">Aggregating Anonymous Cafeteria Insights...</h3>
        <p className="text-xs text-slate-500">Processing aggregate acceptance and waste models</p>
      </div>
    );
  }

  const metrics = insights?.metrics || {
    total_analyzed: 247,
    accepted_count: 184,
    rejected_count: 63,
    acceptance_rate: 74.5,
    estimated_avoidable_waste_kg: 11.0,
    waste_formula_explanation: "63 rejected meals × 250g avg portion × 0.70 estimated uneaten fraction = 11.0 kg estimated avoidable waste."
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${easyMode ? 'easy-mode' : ''}`}>
      
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 text-teal-700 font-bold">
              <BarChart3 className="w-7 h-7 text-teal-600" />
              <h2 className="text-2xl font-extrabold text-slate-900">Cafeteria Accessibility & Waste Insights</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Anonymous aggregate feedback loop connecting individual sensory comfort to institutional food waste reduction.
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>100% Anonymous Aggregate Data</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Analyzed</p>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.total_analyzed}</p>
          <p className="text-[11px] text-slate-500">Total evaluations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 space-y-1 shadow-sm">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Accepted Meals</p>
          <p className="text-3xl font-extrabold text-teal-700">{metrics.accepted_count}</p>
          <p className="text-[11px] text-teal-800 flex items-center space-x-1">
            <ThumbsUp className="w-3 h-3 text-teal-600 inline" />
            <span>High compatibility</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 space-y-1 shadow-sm">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Rejected Meals</p>
          <p className="text-3xl font-extrabold text-amber-700">{metrics.rejected_count}</p>
          <p className="text-[11px] text-amber-800 flex items-center space-x-1">
            <ThumbsDown className="w-3 h-3 text-amber-600 inline" />
            <span>Mismatched profile</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acceptance Rate</p>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.acceptance_rate}%</p>
          <p className="text-[11px] text-slate-500">Satisfaction index</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 space-y-1 col-span-2 md:col-span-1 shadow-sm">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Avoidable Waste</p>
          <p className="text-3xl font-extrabold text-teal-700">{metrics.estimated_avoidable_waste_kg} kg</p>
          <p className="text-[11px] text-teal-800">Estimated weight saved</p>
        </div>

      </div>

      {/* Waste Reduction Engine Explanation */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm uppercase tracking-wider">
          <Leaf className="w-5 h-5 text-teal-600" />
          <span>Waste Reduction Calculation Model</span>
        </div>
        
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
          <p className="text-xs text-slate-700 font-mono font-semibold">
            estimated_waste = rejected_meals × average_portion_weight × waste_factor
          </p>
          <p className="text-xs text-teal-800 font-medium">
            {metrics.waste_formula_explanation}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase text-[10px] border border-amber-200">
            MODEL ESTIMATE
          </span>
          <span>Calculated using mathematical projections based on portion analytics.</span>
        </div>
      </div>

      {/* Anonymous Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Accepted Traits */}
        <div className="bg-white p-6 rounded-2xl border border-teal-200 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-teal-800 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h3>Most Accepted Sensory Characteristics</h3>
          </div>
          <ul className="space-y-2.5">
            {(insights?.most_accepted_traits || []).map((trait, idx) => (
              <li key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-800 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rejected Traits */}
        <div className="bg-white p-6 rounded-2xl border border-amber-200 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3>Frequently Rejected Characteristics</h3>
          </div>
          <ul className="space-y-2.5">
            {(insights?.frequently_rejected_traits || []).map((trait, idx) => (
              <li key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-800 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Meal Planning Insight Simulation */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-teal-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-teal-800 font-extrabold">
            <Lightbulb className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-extrabold text-slate-900">SYSTEM CAFETERIA INSIGHT</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
              Potential Waste Reduction: ↓ {insights?.simulated_waste_reduction_percent || 18.4}%
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          <strong>Suggested Action:</strong> Consider preparing fewer portions of high-spice/strong-smell meals and increasing flexible mild/soft alternatives based on observed user preference patterns.
        </p>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-600">
          <strong className="text-slate-800">Classification: </strong>
          Reflects <span className="text-teal-800 font-semibold">“Observed user preference patterns”</span> from anonymous sample datasets.
        </div>
      </div>

      {/* FEATURE 5 — Meal Acceptance Prediction */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3 text-teal-800 font-extrabold">
          <TrendingUp className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl font-extrabold text-slate-900">Meal Acceptance Prediction</h3>
        </div>
        <p className="text-xs text-slate-500">Tomorrow's menu — prototype estimates based on anonymous feedback and sample sensory profiles.</p>

        <div className="space-y-2">
          {(menuPrediction?.items || []).map((item) => (
            <div key={item.food_id} className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-700 w-40 truncate shrink-0">{item.food_name}</span>
              <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.expected_compatibility >= 75 ? 'bg-teal-500' :
                    item.expected_compatibility >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.expected_compatibility}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-800 w-12 text-right shrink-0">
                {Math.round(item.expected_compatibility)}%
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 italic">
          {menuPrediction?.disclaimer || "Prototype estimates based on anonymous feedback — not a guarantee of actual acceptance."}
        </p>
      </div>

      {/* FEATURE 6 — Accessibility → Sustainability Loop */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 text-teal-800 font-extrabold">
          <Recycle className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl font-extrabold text-slate-900">Accessibility → Sustainability Loop</h3>
        </div>

        <div className="flex flex-col items-center space-y-1">
          {[
            "Sensory Preferences",
            "Meal Compatibility",
            "User Acceptance",
            "Anonymous Feedback",
            "Cafeteria Insights",
            "Better Meal Planning",
            "Potential Waste Reduction"
          ].map((step, idx, arr) => (
            <React.Fragment key={step}>
              <div className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 text-center w-64">
                {step}
              </div>
              {idx < arr.length - 1 && (
                <ArrowDown className="w-4 h-4 text-teal-500" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Rejected Meals</p>
            <p className="text-2xl font-black text-slate-900">{metrics.rejected_count}</p>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Average Portion</p>
            <p className="text-2xl font-black text-slate-900">250 g</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-center">
            <p className="text-[10px] uppercase font-bold text-teal-800">Est. Avoidable Waste</p>
            <p className="text-2xl font-black text-teal-700">{metrics.estimated_avoidable_waste_kg} kg</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic text-center">
          Prototype estimate — not measured physical waste.
        </p>
      </div>

    </div>
  );
}
