import React, { useState } from 'react';
import { UserCheck, ScanLine, Sliders, ThumbsUp, BarChart3, Leaf, ArrowRight, RotateCcw, CheckCircle2, Sparkles, Compass, Utensils } from 'lucide-react';
import VisualTransition from '../components/VisualTransition';
import CompatibilityRing from '../components/CompatibilityRing';
import ExplainableBadge from '../components/ExplainableBadge';
import { api } from '../services/api';

export default function DemoModePage({ onCompleteDemo, easyMode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMealState, setSelectedMealState] = useState(null);

  const handleReset = async () => {
    await api.resetDemo();
    setCurrentStep(1);
    setSelectedMealState(null);
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-8 ${easyMode ? 'easy-mode' : ''}`}>
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-xl">
            <Compass className="w-6 h-6 text-amber-600" />
            <h2>SENSEPLATE Guided System Tour</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Interactive step-by-step tour demonstrating the complete sensory accessibility to sustainability feedback loop.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-stone-100 border border-stone-200 flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tour</span>
          </button>
          
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Step {currentStep} of 6
          </span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map(num => (
          <button
            key={num}
            onClick={() => setCurrentStep(num)}
            className={`h-2.5 flex-1 rounded-full transition-all ${
              num <= currentStep ? 'bg-teal-600 shadow-sm' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* STEP 1: Meet Alex */}
      {currentStep === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-teal-700 font-bold">
            <UserCheck className="w-8 h-8 text-teal-600" />
            <h3 className="text-2xl font-extrabold text-slate-900">STEP 1: User Profile Configuration</h3>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            Alex is a cafeteria user who experiences sensory overwhelm with certain food textures and high spice levels.
          </p>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-base">Alex's Sensory Preferences:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold bg-white p-3 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Soft textures preferred</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-800 font-semibold bg-white p-3 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Mild spice tolerance (Avoids High Spice)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-800 font-semibold bg-white p-3 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Low smell intensity preference</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-800 font-semibold bg-white p-3 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Separate food arrangement</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center space-x-2 text-sm shadow-sm"
            >
              <span>Next: Scan "Masala Dosa"</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Scan Masala Dosa */}
      {currentStep === 2 && (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-teal-700 font-bold">
            <ScanLine className="w-8 h-8 text-teal-600" />
            <h3 className="text-2xl font-extrabold text-slate-900">STEP 2: Food Analysis — "Masala Dosa"</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-teal-600" />
                <span>Masala Dosa</span>
              </h4>
              <p className="text-xs text-slate-500">
                Ingredients: Crispy Rice Crepe, Spiced Potato Masala, Sambar, Chutney
              </p>
              <div className="pt-2 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Texture:</span> <strong className="text-amber-800">Crispy (Crunchiness: 8.5/10)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Spice Level:</span> <strong className="text-rose-700">6.0/10 (Medium-High)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Smell Intensity:</span> <strong className="text-purple-700">6.5/10</strong>
                </div>
                <div className="flex justify-between">
                  <span>Arrangement:</span> <strong className="text-slate-900">Mixed</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <h5 className="font-bold text-slate-700">AI Computer Vision Confidence:</h5>
              <div className="flex justify-between text-teal-700 font-mono font-bold">
                <span>Identification:</span> <span>95%</span>
              </div>
              <div className="flex justify-between text-teal-700 font-mono font-bold">
                <span>Texture Estimation:</span> <span>88%</span>
              </div>
              <div className="flex justify-between text-amber-700 font-mono font-bold">
                <span>Crunchiness Estimation:</span> <span>54% (Uncertainty Flag)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center space-x-2 text-sm shadow-sm"
            >
              <span>Next: Calculate Compatibility</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Compatibility Calculation */}
      {currentStep === 3 && (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-amber-800 font-bold">
            <Sliders className="w-8 h-8 text-amber-600" />
            <h3 className="text-2xl font-extrabold text-slate-900">STEP 3: Sensory Matching Engine Output</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-6 bg-stone-50 p-8 rounded-2xl border border-stone-200">
            <CompatibilityRing score={58} size={120} strokeWidth={8} />

            <div className="space-y-3 max-w-md">
              <h4 className="font-extrabold text-slate-900 text-lg">Masala Dosa — 58% Compatibility Score</h4>
              <ExplainableBadge items={[
                "⚠ Crispy texture differs from preferred (Soft)",
                "⚠ Stronger spice level (6.0/10) marked as avoid",
                "✓ High predictability, familiar food"
              ]} />
              <p className="text-xs text-amber-900 italic font-medium">
                “Low/moderate match because this meal contains high spice and crispy texture marked as avoid.”
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center space-x-2 text-sm shadow-sm"
            >
              <span>Next: Recommend Alternative Meal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: System Recommends Idli Sambar */}
      {currentStep === 4 && (
        <div className="bg-white p-8 rounded-3xl border border-teal-200 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-teal-700 font-bold">
            <Sparkles className="w-8 h-8 text-teal-600" />
            <h3 className="text-2xl font-extrabold text-slate-900">STEP 4: Top Recommendation — "Idli + Mild Sambar"</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-6 bg-stone-50 p-8 rounded-2xl border border-teal-200">
            <CompatibilityRing score={94} size={120} strokeWidth={8} />

            <div className="space-y-3 max-w-md">
              <h4 className="font-extrabold text-slate-900 text-xl">Idli with Sambar</h4>
              <p className="text-xs text-slate-500">Steamed rice cakes served with mild lentil stew and coconut chutney.</p>
              <ExplainableBadge items={[
                "✓ Soft texture matches preference",
                "✓ Mild flavour matches preference",
                "✓ Low smell intensity (2.0/10)",
                "✓ High predictability, familiar food"
              ]} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSelectedMealState('suitable');
                setCurrentStep(5);
              }}
              className="px-8 py-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 text-base"
            >
              <ThumbsUp className="w-5 h-5" />
              <span>Select Meal: Suitable Choice</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Feedback Recorded */}
      {currentStep === 5 && (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-6 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-200">
            <ThumbsUp className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900">STEP 5: Feedback & Learning Loop Integration</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            The user accepts the meal. SENSEPLATE logs anonymous feedback into SQLite, updating individual weights and feeding aggregate stats into the cafeteria dashboard.
          </p>

          <div className="p-4 rounded-xl bg-stone-50 text-xs text-teal-800 font-bold border border-stone-200 max-w-md mx-auto">
            “Your preferences are becoming more personalized. Anonymous cafeteria feedback recorded.”
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setCurrentStep(6)}
              className="px-8 py-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 text-base"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Next: View Cafeteria Sustainability Loop</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Sustainability Dashboard & Visual Transition */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 text-teal-700 font-bold">
              <Leaf className="w-8 h-8 text-teal-600" />
              <h3 className="text-2xl font-extrabold text-slate-900">STEP 6: Cafeteria Waste Reduction Feedback Loop</h3>
            </div>
            
            <p className="text-slate-600 text-sm">
              See how individual meal choice connects directly to institutional cafeteria planning and food waste reduction:
            </p>
          </div>

          <VisualTransition activeStep={6} />

          <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4 shadow-sm">
            <h4 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider">CORE VALUE PROPOSITION</h4>
            <p className="text-base font-extrabold text-gradient max-w-xl mx-auto">
              “Traditional food systems ask: What food should everyone eat? SENSEPLATE asks: What food environment works for this person?”
            </p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Better food choices for people. Better planning for cafeterias. Less avoidable food waste.
            </p>

            <div className="pt-4 flex justify-center space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-stone-100 border border-stone-200"
              >
                Replay Guided Tour
              </button>
              <button
                onClick={onCompleteDemo}
                className="px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm text-xs"
              >
                Explore Full Platform
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
