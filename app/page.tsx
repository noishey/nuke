'use client';

import { useState, useEffect } from 'react';
import SynthComponent from '../components/Synth';
import ChordProgressionAnalyzer from '../components/ChordProgressionAnalyzer';
import AudioVisualizer from '../components/AudioVisualizer';

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
    <main className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          NUKE - Audio Synthesizer & Chord Explorer
        </h1>
        
        {/* Single Unified Widget Container */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
          {/* Header with Status */}
          <div className="mb-6 pb-4 border-b border-gray-600">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-white">
                  <span className="font-semibold">Notes:</span>
                  <span className="ml-2 text-blue-400">
                    {currentNotes.join(', ') || 'None'}
                  </span>
                </div>
                <div className="text-white">
                  <span className="font-semibold">Chord:</span>
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

          {/* Main Content Grid */}
          <div className="space-y-6">
            {/* Top Row: Synth and Chord Analyzer */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Synthesizer
                </h3>
                <SynthComponent onNotePlay={handleNotePlay} />
              </div>
              
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  Chord Analysis
                </h3>
                <ChordProgressionAnalyzer 
                  currentNotes={currentNotes}
                  onChordDetected={handleChordDetected}
                />
              </div>
            </div>

            {/* Bottom Row: Audio Visualizer */}
            <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Audio Visualizer
              </h3>
              <div className="flex justify-center">
                <AudioVisualizer width={800} height={200} type="frequency" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
