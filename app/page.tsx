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
            Chord Visualizer & Progression Explorer
          </h1>
          <div className="text-white text-center">Loading audio components...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Chord Visualizer & Progression Explorer
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SynthComponent onNotePlay={handleNotePlay} />
          <ChordProgressionAnalyzer 
            currentNotes={currentNotes}
            onChordDetected={handleChordDetected}
          />
        </div>
        
        <div className="mb-8">
          <AudioVisualizer width={800} height={300} type="frequency" />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-white text-xl mb-4">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div>
              <div>
                <strong>Active Notes:</strong>
                <div className="text-sm text-gray-300">
                  {currentNotes.join(', ') || 'None'}
                </div>
              </div>
            </div>
            <div>
              <div>
                <strong>Current Chord:</strong>
                <div className="text-sm text-gray-300">
                  {currentChord || 'None detected'}
                </div>
              </div>
            </div>
            <div>
              <div>
                <strong>Status:</strong>
                <div className="text-sm text-green-400">
                  Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
