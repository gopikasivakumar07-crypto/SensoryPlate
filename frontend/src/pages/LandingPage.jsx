import React from 'react';
import { Sparkles, Brain, Utensils, Recycle, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onStart, onViewCafeteria, onStartDemo }) {
  return (
    <div className="space-y-12 py-4 md:py-8">
      
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 md:p-14 border border-stone-200 shadow-sm text-center space-y-8">
        
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Neuroinclusive Accessibility & Food Sustainability</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            SENSEPLATE
          </h1>
          <p className="text-2xl md:text-3xl font-extrabold text-gradient">
            “Food that understands you.”
          </p>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            A sensory-aware food accessibility and waste-reduction platform designed to personalize meals and inform institutional cafeteria planning.
          </p>
          <blockquote className="text-xs md:text-sm italic text-slate-500 pt-3 border-t border-stone-200 max-w-xl mx-auto font-medium">
            “We don't ask neurodivergent people to adapt to food. We make food environments adapt to them.”
          </blockquote>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2"
          >
            <Utensils className="w-5 h-5" />
            <span>Try SENSEPLATE</span>
          </button>

          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Compass className="w-5 h-5 text-amber-700" />
            <span>Explore System Tour</span>
          </button>

          <button
            onClick={onViewCafeteria}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Recycle className="w-5 h-5 text-teal-700" />
            <span>View Cafeteria Insights</span>
          </button>
        </div>

        {/* Safety & Non-Medical Note */}
        <div className="pt-4 text-xs text-slate-500 flex items-center justify-center space-x-2 max-w-lg mx-auto">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>SENSEPLATE supports food-choice accessibility using user-provided preferences. It is not a medical diagnostic system.</span>
        </div>

      </div>

      {/* Three Core Concepts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-7 rounded-2xl border border-stone-200 glass-card-hover space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Understand Sensory Needs</span>
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Maps individual comfort across texture, taste, spice, smell, serving temperature, arrangement separation, and predictability without clinical labeling.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-stone-200 glass-card-hover space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-200">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Find Suitable Food</span>
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Multimodal computer vision and AI sensory matching generate transparent 0–100% compatibility scores accompanied by explainable reasoning badges.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-stone-200 glass-card-hover space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
            <Recycle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Reduce Avoidable Waste</span>
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Anonymous user feedback transforms into institutional cafeteria meal-planning simulations, helping kitchens optimize menus and reduce food waste.
          </p>
        </div>

      </div>

    </div>
  );
}
