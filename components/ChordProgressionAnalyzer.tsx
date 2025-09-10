'use client';

import { useState, useEffect } from 'react';

interface ChordProgressionAnalyzerProps {
  currentNotes: string[];
  onChordDetected?: (chord: string) => void;
}

export default function ChordProgressionAnalyzer({ currentNotes, onChordDetected }: ChordProgressionAnalyzerProps) {
  const [detectedKey, setDetectedKey] = useState<string>('C');
  const [suggestedChords, setSuggestedChords] = useState<string[]>([]);

  // Detect key from current notes
  useEffect(() => {
    if (currentNotes.length === 0) return;

    // Simple key detection based on note frequency
    const noteCount: { [key: string]: number } = {};
    currentNotes.forEach(note => {
      const baseNote = note.replace(/[0-9]/g, ''); // Remove octave numbers
      noteCount[baseNote] = (noteCount[baseNote] || 0) + 1;
    });

    // Find the most frequent note as potential key
    const mostFrequentNote = Object.keys(noteCount).reduce((a, b) => 
      noteCount[a] > noteCount[b] ? a : b
    );

    setDetectedKey(mostFrequentNote);
  }, [currentNotes]);

  // Generate suggested chords based on detected key
  useEffect(() => {
    const generateChordsForKey = (rootKey: string) => {
      const majorScale = {
        'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
        'C#': ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim'],
        'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
        'D#': ['D#', 'E#m', 'F##m', 'G#', 'A#', 'B#m', 'C##dim'],
        'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
        'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
        'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
        'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
        'G#': ['G#', 'A#m', 'B#m', 'C#', 'D#', 'E#m', 'F##dim'],
        'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
        'A#': ['A#', 'B#m', 'C##m', 'D#', 'E#', 'F##m', 'G##dim'],
        'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim']
      };

      return majorScale[rootKey as keyof typeof majorScale] || [];
    };

    setSuggestedChords(generateChordsForKey(detectedKey));
  }, [detectedKey]);

  const chordTypes = [
    { name: 'I - Tonic', index: 0 },
    { name: 'ii - Supertonic', index: 1 },
    { name: 'iii - Mediant', index: 2 },
    { name: 'IV - Subdominant', index: 3 },
    { name: 'V - Dominant', index: 4 },
    { name: 'vi - Submediant', index: 5 },
    { name: 'vii° - Leading Tone', index: 6 }
  ];

  return (
    <div className="space-y-4">
      {/* Current Notes Display */}
      <div>
        <h4 className="text-white text-lg mb-2">Current Notes:</h4>
        <div className="bg-gray-700 p-3 rounded-lg">
          <span className="text-white">
            {currentNotes.length > 0 ? currentNotes.join(', ') : 'No notes played'}
          </span>
        </div>
      </div>

      {/* Detected Key */}
      <div>
        <h4 className="text-white text-lg mb-2">Detected Key:</h4>
        <div className="bg-gray-700 p-3 rounded-lg">
          <span className="text-white font-semibold">{detectedKey} Major</span>
        </div>
      </div>
      
      {/* Suggested Chords */}
      <div>
        <h4 className="text-white text-lg mb-3">Suggested Chords in {detectedKey} Major:</h4>
        <div className="grid grid-cols-1 gap-2">
          {chordTypes.map((chordType, index) => (
            <div 
              key={index}
              className="bg-gray-700 border border-gray-600 p-3 rounded-lg flex justify-between items-center hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div>
                <span className="text-white font-bold text-lg">
                  {suggestedChords[chordType.index] || 'N/A'}
                </span>
                <span className="text-gray-300 ml-2 text-sm">
                  ({chordType.name})
                </span>
              </div>
              <div className="text-gray-300 text-sm">
                {['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][chordType.index]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p>💡 Key detection based on most frequent notes played</p>
        <p>🎵 Try chord progressions like I-V-vi-IV or ii-V-I</p>
      </div>
    </div>
  );
}