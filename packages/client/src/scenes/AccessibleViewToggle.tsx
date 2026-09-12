import React, { useEffect } from 'react';
import { Layers, Eye, Sparkles } from 'lucide-react';

interface AccessibleViewToggleProps {
  is3D: boolean;
  onToggle: (val: boolean) => void;
  className?: string;
}

export default function AccessibleViewToggle({ is3D, onToggle, className = '' }: AccessibleViewToggleProps) {
  // Listen for keyboard shortcut Alt+V to toggle view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        onToggle(!is3D);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [is3D, onToggle]);

  return (
    <div className={`inline-flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-md p-1 rounded-xl border border-gray-800 shadow-xl ${className}`}>
      <button
        type="button"
        onClick={() => onToggle(true)}
        aria-pressed={is3D}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          is3D
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950 font-semibold'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
        }`}
        title="Explore data as an interactive 3D spatial environment"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
        <span>3D Spatial View</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(false)}
        aria-pressed={!is3D}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          !is3D
            ? 'bg-gray-800 text-white border border-gray-700 shadow-sm font-semibold'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
        }`}
        title="Switch to WCAG-compliant flat scorecard and data tables (Alt+V)"
      >
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span>Accessible Flat View</span>
        <span className="hidden sm:inline-block font-mono text-[10px] text-gray-500 bg-gray-950 px-1 rounded">
          Alt+V
        </span>
      </button>
    </div>
  );
}
