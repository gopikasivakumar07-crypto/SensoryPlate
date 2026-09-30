import React, { useState, useEffect } from 'react';
import { ScanLine, Upload, Utensils, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Flame, Zap, Apple, Activity, RefreshCw, Layers, Gauge } from 'lucide-react';
import { api } from '../services/api';
import SensoryBar from '../components/SensoryBar';
import UncertaintyModal from '../components/UncertaintyModal';

export default function FoodScannerPage({ onProceedToMatch, easyMode }) {
  const [foodsList, setFoodsList] = useState([]);
  const [selectedDemoId, setSelectedDemoId] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uncertaintyModalData, setUncertaintyModalData] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await api.getFoods();
      setFoodsList(data);
      if (data && data.length > 0) {
        handleAnalyze(data[0].id, null);
      }
    }
    load();
  }, []);

  const handleAnalyze = async (demoId = null, imageBase64 = null) => {
    setAnalyzing(true);
    if (demoId) {
      setSelectedDemoId(demoId);
      setUploadedImagePreview(null);
    }
    const res = await api.analyzeFood(demoId, imageBase64);
    setAnalysisResult(res);
    setAnalyzing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result;
        setUploadedImagePreview(base64Str);
        setSelectedDemoId(null);
        handleAnalyze(null, base64Str);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttributeCorrected = (attr, val) => {
    if (analysisResult && analysisResult.sensory_profile) {
      setAnalysisResult({
        ...analysisResult,
        sensory_profile: {
          ...analysisResult.sensory_profile,
          [attr]: val
        },
        uncertainties: (analysisResult.uncertainties || []).filter(u => !u.toLowerCase().includes(attr.toLowerCase()))
      });
    }
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-8 ${easyMode ? 'easy-mode' : ''}`}>
      
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-3 text-teal-700 font-bold">
          <ScanLine className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-extrabold text-slate-900">Food Scanner & AI Vision Engine</h2>
        </div>
        <p className="text-sm text-slate-600">
          Upload any meal photo to trigger vision analysis for dish identification, dynamic nutrition extraction, and sensory characteristics.
        </p>
      </div>

      {/* Input Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Card */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Upload Food Image</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any food photo from your computer to run vision recognition.
            </p>
          </div>

          <label className="cursor-pointer border-2 border-dashed border-stone-300 hover:border-teal-600 rounded-xl p-5 text-center bg-stone-50/70 transition-all duration-200 block group">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Upload className="w-7 h-7 text-teal-600 mx-auto mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 block">Click to upload meal photo</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">JPEG, PNG, WEBP supported</span>
          </label>
        </div>

        {/* Standard Meal Profile Picker */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-teal-600" />
              <span>Standard Meal Profiles</span>
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Preset Library
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {foodsList.map(food => (
              <button
                key={food.id}
                onClick={() => handleAnalyze(food.id, null)}
                className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border flex flex-col justify-between space-y-1 ${
                  selectedDemoId === food.id
                    ? 'bg-teal-50 text-teal-900 border-teal-500 shadow-sm font-bold'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                <span className="font-bold truncate">{food.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">{food.category}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Uploaded Image Preview & Vision Result */}
      {analyzing ? (
        <div className="bg-white p-12 rounded-2xl text-center space-y-4 border border-teal-200 shadow-sm">
          <RefreshCw className="w-10 h-10 text-teal-600 mx-auto animate-spin" />
          <h3 className="text-lg font-bold text-slate-900">Analyzing Food Image with AI Vision...</h3>
          <p className="text-xs text-slate-500">Detecting dish, computing nutritional values, and evaluating sensory parameters</p>
        </div>
      ) : analysisResult ? (
        
        analysisResult.recognized === false || analysisResult.food_name === "Food not confidently recognized" ? (
          /* Low Confidence / Unrecognized Error Card */
          <div className="bg-white p-8 rounded-2xl border-2 border-amber-300 shadow-sm space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-800 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">Food Not Confidently Recognized</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {analysisResult.message || "The AI engine could not reliably identify the dish in the uploaded image. To ensure accurate nutrition and sensory compatibility, please upload a clearer image of your meal."}
                </p>
              </div>
            </div>

            {uploadedImagePreview && (
              <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-stone-200 shadow-inner">
                <img src={uploadedImagePreview} alt="Uploaded meal" className="w-full h-48 object-cover opacity-75" />
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <label className="cursor-pointer px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center space-x-2 text-sm">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Upload className="w-4 h-4" />
                <span>Upload Clearer Image</span>
              </label>

              <button
                onClick={() => handleAnalyze(1, null)}
                className="px-6 py-3 rounded-xl font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors text-sm"
              >
                Use Standard Preset Profile
              </button>
            </div>
          </div>
        ) : (
          /* Recognized Dish Analysis Result */
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            
            {/* Header / Dish Name */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
              <div className="flex items-start space-x-4">
                {uploadedImagePreview ? (
                  <img src={uploadedImagePreview} alt={analysisResult.food_name} className="w-20 h-20 rounded-xl object-cover border border-stone-200 shadow-sm shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                    <Utensils className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-extrabold text-slate-900">{analysisResult.food_name}</h3>
                  </div>
                  {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Ingredients: <span className="text-slate-700 font-medium">{analysisResult.ingredients.join(' • ')}</span>
                    </p>
                  )}
                  {analysisResult.detected_foods && analysisResult.detected_foods.length > 1 && (
                    <div className="flex items-center space-x-1.5 mt-2">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-xs text-slate-600">Detected items: <strong className="text-slate-800">{analysisResult.detected_foods.join(', ')}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>AI Confidence: {Math.round((analysisResult.confidence_score || 0.95) * 100)}%</span>
                </div>
                {analysisResult.is_demo_fallback && (
                  <span className="text-[10px] text-slate-400 font-medium">Standard Preset Profile</span>
                )}
              </div>
            </div>

            {/* Sensory Load Estimate */}
            {analysisResult.sensory_load && (
              <div className={`p-5 rounded-xl border space-y-3 ${
                analysisResult.sensory_load.level === 'HIGH' ? 'bg-rose-50 border-rose-200' :
                analysisResult.sensory_load.level === 'MEDIUM' ? 'bg-amber-50 border-amber-200' :
                'bg-teal-50 border-teal-200'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Gauge className={`w-5 h-5 ${
                      analysisResult.sensory_load.level === 'HIGH' ? 'text-rose-600' :
                      analysisResult.sensory_load.level === 'MEDIUM' ? 'text-amber-600' : 'text-teal-600'
                    }`} />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Sensory Load</h4>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900 font-mono">{analysisResult.sensory_load.score}/100</span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                      analysisResult.sensory_load.level === 'HIGH' ? 'bg-rose-600 text-white' :
                      analysisResult.sensory_load.level === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-teal-600 text-white'
                    }`}>
                      {analysisResult.sensory_load.level}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      analysisResult.sensory_load.level === 'HIGH' ? 'bg-rose-500' :
                      analysisResult.sensory_load.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${analysisResult.sensory_load.score}%` }}
                  />
                </div>
                {analysisResult.sensory_load.reasons && analysisResult.sensory_load.reasons.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {analysisResult.sensory_load.reasons.map((r, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-slate-500" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[11px] text-slate-500 italic">
                  {analysisResult.sensory_load.disclaimer || "AI-assisted estimate — not a medical assessment or diagnosis."}
                </p>
              </div>
            )}

            {/* Dynamic Nutrition Information Panel */}
            {analysisResult.nutrition && (
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Nutrition Breakdown (Per Serving)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">AI Calculated</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Calories</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{analysisResult.nutrition.calories}</span>
                    <span className="text-[10px] text-slate-500 block">kcal</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Protein</span>
                    <span className="text-lg font-black text-teal-700 font-mono">{analysisResult.nutrition.protein}g</span>
                    <span className="text-[10px] text-slate-500 block">protein</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Carbs</span>
                    <span className="text-lg font-black text-amber-700 font-mono">{analysisResult.nutrition.carbs}g</span>
                    <span className="text-[10px] text-slate-500 block">carbohydrates</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fat</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{analysisResult.nutrition.fat}g</span>
                    <span className="text-[10px] text-slate-500 block">total fat</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fiber</span>
                    <span className="text-lg font-black text-teal-700 font-mono">{analysisResult.nutrition.fiber}g</span>
                    <span className="text-[10px] text-slate-500 block">dietary fiber</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sodium</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{analysisResult.nutrition.sodium}mg</span>
                    <span className="text-[10px] text-slate-500 block">sodium</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sugar</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{analysisResult.nutrition.sugar}g</span>
                    <span className="text-[10px] text-slate-500 block">sugar</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sensory Profile Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Sensory Characteristics</h4>
                
                <SensoryBar label="Texture Softness" value={analysisResult.sensory_profile.softness} color="emerald" icon={<Utensils className="w-3.5 h-3.5" />} />
                <SensoryBar label="Spice Level" value={analysisResult.sensory_profile.spice} color="rose" icon={<Flame className="w-3.5 h-3.5 text-rose-500" />} />
                <SensoryBar label="Smell Intensity" value={analysisResult.sensory_profile.smell_intensity} color="purple" icon={<Zap className="w-3.5 h-3.5 text-purple-500" />} />
                <SensoryBar 
                  label="Crunchiness" 
                  value={analysisResult.sensory_profile.crunchiness} 
                  color="amber" 
                  icon={<Apple className="w-3.5 h-3.5 text-amber-500" />} 
                  uncertainty={(analysisResult.uncertainties || []).some(u => u.toLowerCase().includes('crunch'))}
                  onCorrect={() => setUncertaintyModalData({ foodId: analysisResult.food_id, attribute: 'crunchiness', currentValue: analysisResult.sensory_profile.crunchiness })}
                />
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Structural & Thermal Parameters</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <span className="text-slate-700 font-medium">Mixed Texture / Arrangement</span>
                    <span className={`font-bold px-2.5 py-1 rounded-md ${analysisResult.sensory_profile.mixed_texture ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-teal-100 text-teal-900 border border-teal-200'}`}>
                      {analysisResult.sensory_profile.mixed_texture ? 'YES (Mixed)' : 'NO (Separate)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <span className="text-slate-700 font-medium">Serving Temperature</span>
                    <span className="font-bold text-slate-900 px-2.5 py-1 rounded-md bg-stone-200">
                      {analysisResult.sensory_profile.temperature}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <span className="text-slate-700 font-medium">Predictability Index</span>
                    <span className="font-bold text-teal-700 font-mono text-sm">
                      {analysisResult.sensory_profile.predictability}/10
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Confidence Breakdown */}
            {analysisResult.confidence && (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Parameter Estimation Confidence</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(analysisResult.confidence).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-stone-200">
                      <span className="text-slate-500 capitalize">{key.replace('_estimation', '').replace('_', ' ')}:</span>
                      <span className={`font-mono font-bold ${val < 0.65 ? 'text-amber-700' : 'text-teal-700'}`}>
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proceed CTA */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onProceedToMatch(analysisResult.food_id)}
                className="px-8 py-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 text-base"
              >
                <span>Check Compatibility with My Profile</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )
      ) : null}

      {/* Uncertainty Modal */}
      {uncertaintyModalData && (
        <UncertaintyModal
          foodId={uncertaintyModalData.foodId}
          attribute={uncertaintyModalData.attribute}
          currentValue={uncertaintyModalData.currentValue}
          onClose={() => setUncertaintyModalData(null)}
          onUpdated={handleAttributeCorrected}
        />
      )}

    </div>
  );
}
