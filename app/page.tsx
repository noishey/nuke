'use client';

import { useState, useEffect } from 'react';
import SynthComponent from '../components/Synth';
import ChordProgressionAnalyzer from '../components/ChordProgressionAnalyzer';

export default function Home() {
  const [currentNotes, setCurrentNotes] = useState<string[]>([]);
  const [currentChord, setCurrentChord] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNotePlay = (note: string, velocity: number) => {
    setCurrentNotes(prev => {
      const newNotes = [...prev, note];
      return newNotes.slice(-6);
    });
  };

  const handleChordDetected = (chord: string) => {
    setCurrentChord(chord);
  };

  if (!isClient) {
    return (
      <main className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            NUKE - Audio Synthesizer & Chord Explorer
          </h1>
          <div className="text-white text-center">Loading audio components...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-3">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          NUKE - Audio Synthesizer & Chord Explorer
        </h1>
        
        {/* Compact Status Bar */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4 shadow-lg border border-gray-700">
          <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <span className="font-medium">Notes:</span>
                <span className="ml-2 text-blue-400">
                  {currentNotes.join(', ') || 'None'}
                </span>
              </div>
              <div className="text-white">
                <span className="font-medium">Chord:</span>
                <span className="ml-2 text-green-400">
                  {currentChord || 'None detected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Ready</span>
            </div>
          </div>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-3 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Synthesizer
            </h3>
            <SynthComponent onNotePlay={handleNotePlay} />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-3 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Chord Analysis
            </h3>
            <ChordProgressionAnalyzer 
              currentNotes={currentNotes}
              onChordDetected={handleChordDetected}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
