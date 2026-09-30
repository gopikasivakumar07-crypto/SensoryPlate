import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function SensoryProfilePage({ onSaveComplete, easyMode }) {
  const [profile, setProfile] = useState({
    texture: 'Soft',
    taste: 'Mild',
    spice: 'Mild',
    smell: 'Low',
    temperature: 'Warm',
    food_arrangement: 'Separate',
    predictability: 'Familiar foods preferred',
    preferences: {
      texture: 'Preferred',
      spice: 'Avoid',
      smell: 'Avoid',
      food_arrangement: 'Preferred',
      predictability: 'Preferred'
    }
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await api.getSensoryProfile(1);
      if (data) {
        setProfile({
          texture: data.texture || 'Soft',
          taste: data.taste || 'Mild',
          spice: data.spice || 'Mild',
          smell: data.smell || 'Low',
          temperature: data.temperature || 'Warm',
          food_arrangement: data.food_arrangement || 'Separate',
          predictability: data.predictability || 'Familiar foods preferred',
          preferences: data.preferences || { texture: 'Preferred', spice: 'Avoid', smell: 'Avoid' }
        });
      }
    }
    load();
  }, []);

  const handlePrefTag = (dimension, tag) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [dimension]: tag
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.saveSensoryProfile({ ...profile, user_id: 1 });
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSaveComplete) onSaveComplete();
    }, 1200);
  };

  const renderPreferenceToggle = (dimension) => {
    const currentTag = profile.preferences?.[dimension] || 'Neutral';
    return (
      <div className="flex items-center space-x-1.5 mt-2 sm:mt-0">
        {['Preferred', 'Neutral', 'Avoid'].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handlePrefTag(dimension, tag)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              currentTag === tag
                ? tag === 'Preferred'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : tag === 'Avoid'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-white font-bold'
                : 'bg-stone-100 text-slate-600 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${easyMode ? 'easy-mode' : ''}`}>
      
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-3 text-teal-700 font-bold">
          <Sliders className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-extrabold text-slate-900">Your Sensory Preferences</h2>
        </div>
        <p className="text-sm text-slate-600">
          Configure your food comfort profile. SENSEPLATE uses these parameters to calculate meal compatibility transparently.
        </p>
        <div className="text-xs text-slate-500 flex items-center space-x-1.5 pt-1">
          <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Non-medical setup: Configure comfort levels according to your sensory profile.</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Texture */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-base font-extrabold text-slate-900">Texture</label>
              <p className="text-xs text-slate-500">Primary tactile mouthfeel preferred in meals</p>
            </div>
            {renderPreferenceToggle('texture')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {['Soft', 'Crunchy', 'Crispy', 'Chewy', 'Smooth', 'Mixed textures'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setProfile({ ...profile, texture: t })}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  profile.texture === t
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold shadow-sm'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Spice */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-base font-extrabold text-slate-900">Spice Level</label>
              <p className="text-xs text-slate-500">Heat and pungency intensity tolerance</p>
            </div>
            {renderPreferenceToggle('spice')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {['None', 'Mild', 'Medium', 'High'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setProfile({ ...profile, spice: s })}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  profile.spice === s
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold shadow-sm'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Smell Intensity */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-base font-extrabold text-slate-900">Smell Intensity</label>
              <p className="text-xs text-slate-500">Aroma strength and olfactory intensity</p>
            </div>
            {renderPreferenceToggle('smell')}
          </div>
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {['Low', 'Medium', 'Strong'].map(sm => (
              <button
                key={sm}
                type="button"
                onClick={() => setProfile({ ...profile, smell: sm })}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  profile.smell === sm
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold shadow-sm'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {sm}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-base font-extrabold text-slate-900">Temperature</label>
              <p className="text-xs text-slate-500">Preferred serving temperature</p>
            </div>
            {renderPreferenceToggle('temperature')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {['Cold', 'Room temperature', 'Warm', 'Hot'].map(tp => (
              <button
                key={tp}
                type="button"
                onClick={() => setProfile({ ...profile, temperature: tp })}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  profile.temperature === tp
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold shadow-sm'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* Food Arrangement */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-base font-extrabold text-slate-900">Food Arrangement</label>
              <p className="text-xs text-slate-500">Component separation preferences</p>
            </div>
            {renderPreferenceToggle('food_arrangement')}
          </div>
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {['Separate', 'Mixed', 'Either'].map(ar => (
              <button
                key={ar}
                type="button"
                onClick={() => setProfile({ ...profile, food_arrangement: ar })}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  profile.food_arrangement === ar
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold shadow-sm'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        {/* Predictability */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-base font-extrabold text-slate-900">Predictability</label>
              <p className="text-xs text-slate-500">Novelty vs familiarity comfort</p>
            </div>
            {renderPreferenceToggle('predictability')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {['Familiar foods preferred', 'Open to new foods'].map(pr => (
              <button
                key={pr}
                type="button"
                onClick={() => setProfile({ ...profile, predictability: pr })}
                className={`p-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  profile.predictability === pr
                    ? 'bg-teal-50 text-teal-900 border-teal-500 font-bold shadow-sm'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess ? (
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm bg-teal-50 px-4 py-3 rounded-xl border border-teal-200">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Sensory Profile Saved!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Profiles are saved securely in your session database.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 text-base"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save My Profile'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
