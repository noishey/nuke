'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chord, Scale, Progression, Key } from 'tonal';

interface ChordProgressionAnalyzerProps {
  currentNotes: string[];
  onChordDetected?: (chord: string) => void;
  onProgressionSuggestion?: (suggestions: string[]) => void;
}

export default function ChordProgressionAnalyzer({ 
  currentNotes, 
  onChordDetected, 
  onProgressionSuggestion 
}: ChordProgressionAnalyzerProps) {
  const [progression, setProgression] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [key, setKey] = useState<string>('C');
  const [currentChord, setCurrentChord] = useState<string>('');

  const generateSuggestions = useCallback((currentProgression: string[]) => {
    if (currentProgression.length === 0) return;
    
    const keyScale = Scale.get(`${key} major`);
    const scaleChords = keyScale.notes.map(note => {
      return [
        `${note}`,
        `${note}m`,
        `${note}7`,
        `${note}maj7`
      ];
    }).flat();
    
    // Common progressions in the key
    const commonProgressions = [
      ['I', 'V', 'vi', 'IV'], // Pop progression
      ['vi', 'IV', 'I', 'V'], // Pop progression variant
      ['I', 'vi', 'IV', 'V'], // 50s progression
      ['ii', 'V', 'I'], // Jazz turnaround
      ['I', 'IV', 'V', 'I'], // Classical cadence
    ];
    
    // Convert roman numerals to actual chords in the current key
    const keyChords = commonProgressions.map(prog => 
      Progression.fromRomanNumerals(prog, key)
    ).flat();
    
    // Filter suggestions based on music theory
    const filteredSuggestions = [...new Set([...scaleChords, ...keyChords])]
      .filter(chord => chord !== currentProgression[currentProgression.length - 1])
      .slice(0, 6);
    
    setSuggestions(filteredSuggestions);
    onProgressionSuggestion?.(filteredSuggestions);
  }, [key, onProgressionSuggestion]);

  // Fixed: Added missing dependencies to useEffect
  useEffect(() => {
    if (currentNotes.length >= 2) {
      const detectedChord = Chord.detect(currentNotes);
      if (detectedChord.length > 0) {
        const chord = detectedChord[0];
        setCurrentChord(chord);
        onChordDetected?.(chord);
        
        if (progression[progression.length - 1] !== chord) {
          const newProgression = [...progression, chord].slice(-8);
          setProgression(newProgression);
          generateSuggestions(newProgression);
        }
      }
    }
  }, [currentNotes, onChordDetected, progression, generateSuggestions]);

  const clearProgression = () => {
    setProgression([]);
    setCurrentChord('');
    setSuggestions([]);
  };

  const addChordToProgression = (chord: string) => {
    const newProgression = [...progression, chord].slice(-8);
    setProgression(newProgression);
    setCurrentChord(chord);
    generateSuggestions(newProgression);
    onChordDetected?.(chord);
  };

  const analyzeKey = () => {
    if (progression.length >= 3) {
      // Fixed: Removed unused 'possibleKeys' variable
      // This is a simplified key detection - in a real app, you'd use more sophisticated analysis
      const detectedKey = Key.majorKey(progression[0]);
      if (detectedKey.tonic) {
        setKey(detectedKey.tonic);
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-white text-xl mb-4">Chord Progression Analyzer</h3>
      
      <div className="mb-4">
        <label className="text-white block mb-2">Key:</label>
        <select 
          value={key} 
          onChange={(e) => setKey(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded"
        >
          {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <button 
          onClick={analyzeKey}
          className="ml-2 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
        >
          Auto-detect
        </button>
      </div>
      
      <div className="mb-4">
        <h4 className="text-white text-lg mb-2">Current Chord:</h4>
        <div className="bg-gray-700 p-3 rounded text-white text-xl font-bold">
          {currentChord || 'Play some notes...'}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-white text-lg mb-2">Progression:</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {progression.map((chord, index) => (
            <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded">
              {chord}
            </span>
          ))}
        </div>
        <button 
          onClick={clearProgression}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Clear
        </button>
      </div>
      
      <div>
        <h4 className="text-white text-lg mb-2">Suggested Next Chords:</h4>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((chord, index) => (
            <button
              key={index}
              onClick={() => addChordToProgression(chord)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              {chord}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}