import React, { useState } from 'react';
import { ThumbsUp, Smile, ThumbsDown, CheckCircle2, Sparkles, X, Lightbulb } from 'lucide-react';
import { api } from '../services/api';

export default function FeedbackModalPage({ mealId, mealName, initialRating = 'loved', onClose, onSubmitted }) {
  const [rating, setRating] = useState(initialRating);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultNotice, setResultNotice] = useState(null);
  const [preferenceInsight, setPreferenceInsight] = useState(null);

  const availableTags = [
    'Too spicy',
    'Too crunchy',
    'Too soft',
    'Strong smell',
    'Unexpected texture',
    'Too hot',
    'Too cold',
    'Mixed textures',
    'Other'
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await api.submitFeedback({
      user_id: 1,
      food_id: mealId || 1,
      rating,
      tags: selectedTags,
      comments
    });

    setSubmitting(false);
    setResultNotice(res.updated_weights_notice || res.message);
    setPreferenceInsight(res.preference_insight || null);

    setTimeout(() => {
      if (onSubmitted) onSubmitted();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-lg w-full p-6 md:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">How was this meal?</h3>
            <p className="text-xs text-slate-500 mt-0.5">{mealName || "Selected Meal"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {resultNotice ? (
          <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
            <h4 className="font-extrabold text-slate-900 text-base">Feedback Recorded!</h4>
            <p className="text-xs text-teal-800 font-medium">{resultNotice}</p>
            {preferenceInsight && (
              <div className="text-left bg-white border border-teal-200 rounded-xl p-3.5 flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">Preference Insight</p>
                  <p className="text-xs text-slate-700 font-medium">{preferenceInsight}</p>
                </div>
              </div>
            )}
            <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Updating anonymous cafeteria waste insights in background</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Rating Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRating('loved')}
                className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center space-y-1.5 transition-all border ${
                  rating === 'loved'
                    ? 'bg-teal-50 text-teal-900 border-teal-500 shadow-sm'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <ThumbsUp className="w-5 h-5 text-teal-600" />
                <span>Loved it</span>
              </button>

              <button
                type="button"
                onClick={() => setRating('okay')}
                className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center space-y-1.5 transition-all border ${
                  rating === 'okay'
                    ? 'bg-amber-50 text-amber-900 border-amber-500 shadow-sm'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Smile className="w-5 h-5 text-amber-600" />
                <span>It was okay</span>
              </button>

              <button
                type="button"
                onClick={() => setRating('didnt_work')}
                className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center space-y-1.5 transition-all border ${
                  rating === 'didnt_work'
                    ? 'bg-rose-50 text-rose-900 border-rose-500 shadow-sm'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <ThumbsDown className="w-5 h-5 text-rose-600" />
                <span>Didn't work for me</span>
              </button>
            </div>

            {/* Tag Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Specific Sensory Feedback (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-teal-50 text-teal-900 border-teal-500'
                          : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-stone-100 border border-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm text-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
