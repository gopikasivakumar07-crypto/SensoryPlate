import React from 'react';

export default function SensoryBar({ label, value, max = 10, color = 'emerald', icon = null, uncertainty = false, onCorrect = null }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    emerald: 'bg-teal-600',
    amber: 'bg-amber-500',
    purple: 'bg-purple-600',
    sky: 'bg-sky-600',
    rose: 'bg-rose-500',
  }[color] || 'bg-teal-600';

  return (
    <div className="space-y-1.5 my-2.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-1.5 text-slate-700">
          {icon && <span className="text-slate-500 flex items-center">{icon}</span>}
          <span>{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          {uncertainty && (
            <button
              onClick={onCorrect}
              className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors font-bold"
            >
              Uncertain — Correct
            </button>
          )}
          <span className="font-mono text-slate-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            {typeof value === 'number' ? `${value.toFixed(1)}/10` : value}
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full bg-stone-200/80 rounded-full overflow-hidden p-0.5 border border-stone-300/40">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${colorClasses}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
