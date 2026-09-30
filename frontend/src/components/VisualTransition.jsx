import React from 'react';
import { UserCheck, ScanLine, Sliders, ThumbsUp, BarChart3, Leaf, Sparkles } from 'lucide-react';

export default function VisualTransition({ activeStep = 6 }) {
  const steps = [
    { title: "Personal Preference", desc: "Sensory profile mapped", icon: <UserCheck className="w-5 h-5 text-teal-600" /> },
    { title: "AI Food Analysis", desc: "Multimodal food profile", icon: <ScanLine className="w-5 h-5 text-teal-600" /> },
    { title: "Sensory Match", desc: "Weighted compatibility engine", icon: <Sliders className="w-5 h-5 text-amber-600" /> },
    { title: "User Feedback", desc: "Rating & sensory tags", icon: <ThumbsUp className="w-5 h-5 text-teal-600" /> },
    { title: "Anonymous Insights", desc: "Aggregated patterns", icon: <BarChart3 className="w-5 h-5 text-slate-700" /> },
    { title: "Waste Reduction", desc: "Optimized meal planning", icon: <Leaf className="w-5 h-5 text-teal-600" /> },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 my-6 shadow-sm">
      <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-teal-600" />
        <span>SENSEPLATE Closed-Loop System Architecture</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const isActive = idx + 1 <= activeStep;
          const isCurrent = idx + 1 === activeStep;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-300 relative ${
                isCurrent
                  ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 scale-105 shadow-sm'
                  : isActive
                  ? 'bg-stone-50 border-stone-200'
                  : 'bg-stone-50/50 border-stone-200 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-200 text-slate-700">
                  0{idx + 1}
                </span>
                {step.icon}
              </div>
              
              <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-1">{step.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-600 font-medium">
          “Better food choices for people. Better planning for cafeterias. Less avoidable food waste.”
        </p>
      </div>
    </div>
  );
}
