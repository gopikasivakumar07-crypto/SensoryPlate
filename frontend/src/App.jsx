import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SensoryProfilePage from './pages/SensoryProfilePage';
import FoodScannerPage from './pages/FoodScannerPage';
import RecommendationPage from './pages/RecommendationPage';
import FeedbackModalPage from './pages/FeedbackModalPage';
import CafeteriaDashboardPage from './pages/CafeteriaDashboardPage';
import DemoModePage from './pages/DemoModePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [easyMode, setEasyMode] = useState(false);
  const [feedbackMeal, setFeedbackMeal] = useState(null);

  const handleSelectMeal = (mealId, mealName, rating) => {
    setFeedbackMeal({ mealId, mealName, rating });
  };

  return (
    <div className={`min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-600 selection:text-white ${easyMode ? 'easy-mode' : ''}`}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        easyMode={easyMode}
        setEasyMode={setEasyMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'landing' && (
          <LandingPage
            onStart={() => setActiveTab('profile')}
            onViewCafeteria={() => setActiveTab('cafeteria')}
            onStartDemo={() => setActiveTab('demo')}
          />
        )}

        {activeTab === 'profile' && (
          <SensoryProfilePage
            onSaveComplete={() => setActiveTab('scanner')}
            easyMode={easyMode}
          />
        )}

        {activeTab === 'scanner' && (
          <FoodScannerPage
            onProceedToMatch={(foodId) => setActiveTab('recommendation')}
            easyMode={easyMode}
          />
        )}

        {activeTab === 'recommendation' && (
          <RecommendationPage
            onSelectMeal={handleSelectMeal}
            easyMode={easyMode}
          />
        )}

        {activeTab === 'cafeteria' && (
          <CafeteriaDashboardPage easyMode={easyMode} />
        )}

        {activeTab === 'demo' && (
          <DemoModePage
            onCompleteDemo={() => setActiveTab('recommendation')}
            easyMode={easyMode}
          />
        )}
      </main>

      {/* Feedback Modal */}
      {feedbackMeal && (
        <FeedbackModalPage
          mealId={feedbackMeal.mealId}
          mealName={feedbackMeal.mealName}
          initialRating={feedbackMeal.rating}
          onClose={() => setFeedbackMeal(null)}
          onSubmitted={() => {
            setFeedbackMeal(null);
            setActiveTab('cafeteria');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/80 backdrop-blur-md py-8 text-center text-xs text-slate-500 space-y-1.5 mt-12">
        <p className="font-bold text-slate-800 text-sm">
          SENSEPLATE — Sensory-Aware Food Accessibility & Sustainability System
        </p>
        <p className="max-w-xl mx-auto text-xs text-slate-600">
          “We don't ask neurodivergent people to adapt to food. We make food environments adapt to them.”
        </p>
        <p className="text-[11px] text-slate-500 pt-1">
          Sensory Accessibility & Sustainability Platform • Non-Medical Support System
        </p>
      </footer>

    </div>
  );
}
