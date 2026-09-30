import React from 'react';

export default function CompatibilityRing({ score, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-teal-600 text-teal-700";
  let bgGradient = "from-teal-50 via-stone-50 to-white";
  let label = "High Match";

  if (score < 50) {
    colorClass = "stroke-rose-600 text-rose-700";
    bgGradient = "from-rose-50 via-stone-50 to-white";
    label = "Low Match";
  } else if (score < 75) {
    colorClass = "stroke-amber-600 text-amber-700";
    bgGradient = "from-amber-50 via-stone-50 to-white";
    label = "Moderate";
  }

  return (
    <div className="relative inline-flex items-center justify-center rounded-full p-1 shadow-sm">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-200"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
          fill="transparent"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-gradient-to-br ${bgGradient} border border-stone-200`}>
        <span className="font-extrabold text-xl tracking-tight text-slate-900 font-mono">
          {Math.round(score)}%
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase text-slate-600">
          {label}
        </span>
      </div>
    </div>
  );
}
