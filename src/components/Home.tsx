import React from 'react';
import { Plus, Users, Zap, Star, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HomeProps {
  onCreateSession: () => void;
  onJoinSession: () => void;
}

export function Home({ onCreateSession, onJoinSession }: HomeProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Poiting Poker - Pricing Team</span>
            </div>
            
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Agile Estimation
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline your sprint planning with our intuitive pointing poker tool. 
              Get accurate estimates, engage your team, and ship faster.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center mb-16 max-w-lg mx-auto">
              <button
                onClick={onCreateSession}
                className="group flex-1 relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 h-16 whitespace-nowrap"
              >
                <Plus className="w-6 h-6 flex-shrink-0" />
                <span>Create Session</span>
              </button>
              
              <button
                onClick={onJoinSession}
                className="group flex-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-900 dark:text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 h-16 whitespace-nowrap"
              >
                <Users className="w-6 h-6 flex-shrink-0" />
                <span>Join Session</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-gray-600 dark:text-gray-400">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">50k+ sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">120+ countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">PokerPoint</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              The modern pointing poker tool for agile teams. Simple, fast, and effective story estimation.
            </p>
            <div className="text-sm text-gray-500">
              © 2025 PokerPoint. Built with ❤️ for agile teams worldwide.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}