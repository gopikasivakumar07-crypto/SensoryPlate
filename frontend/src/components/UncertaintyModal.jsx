import React, { useState } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';
import { api } from '../services/api';

export default function UncertaintyModal({ foodId, attribute, currentValue, onClose, onUpdated }) {
  const [newValue, setNewValue] = useState(currentValue || 5);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await api.correctUncertainty(foodId, attribute, parseFloat(newValue));
    setSaving(false);
    onUpdated(attribute, parseFloat(newValue));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-amber-300 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-lg">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span>Correct AI Prediction</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600">
          The AI flag indicates low confidence for <strong className="text-amber-800 capitalize">{attribute}</strong>. 
          Please adjust to reflect actual food property:
        </p>

        <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Low (0)</span>
            <span className="text-teal-700 font-mono text-base font-bold">{newValue}/10</span>
            <span>High (10)</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-stone-100 rounded-lg border border-stone-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-lg flex items-center space-x-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Confirm Human Correction'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
