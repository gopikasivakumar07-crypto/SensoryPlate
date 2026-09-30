import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ExplainableBadge({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-1.5 my-3">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Why this match rating?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => {
          const isCheck = item.startsWith('✓');
          const text = item.replace(/^[✓⚠]\s*/, '');
          
          return (
            <div
              key={idx}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isCheck
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isCheck ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
