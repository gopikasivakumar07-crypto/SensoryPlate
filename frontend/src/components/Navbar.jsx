import React from 'react';
import { Utensils, BarChart3, UserCheck, Eye, Compass, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, easyMode, setEasyMode }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 border-b border-stone-200/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <Utensils className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  SENSEPLATE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sensory-aware food accessibility & sustainability
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'profile'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Sensory Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'scanner' || activeTab === 'recommendation'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <Utensils className="w-4 h-4 text-teal-600" />
              <span>Scan / Find Food</span>
            </button>

            <button
              onClick={() => setActiveTab('cafeteria')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'cafeteria'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>Cafeteria Insights</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'demo'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Guided Tour</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEasyMode(!easyMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                easyMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm font-bold'
                  : 'bg-stone-100 text-slate-700 border-stone-200 hover:bg-stone-200 hover:text-slate-900'
              }`}
              title="Toggle Easy Mode for simplified visual presentation"
            >
              <Eye className="w-4 h-4" />
              <span>{easyMode ? 'Easy Mode ON' : 'Easy Mode'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 py-2.5 px-3 bg-white text-xs font-medium">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${activeTab === 'profile' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>
        <button 
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${activeTab === 'scanner' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Scanner</span>
        </button>
        <button 
          onClick={() => setActiveTab('cafeteria')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${activeTab === 'cafeteria' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Insights</span>
        </button>
        <button 
          onClick={() => setActiveTab('demo')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${activeTab === 'demo' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-600'}`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Tour</span>
        </button>
      </div>
    </header>
  );
}
