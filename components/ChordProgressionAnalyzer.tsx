'use client';

import { useState, useEffect } from 'react';

interface ChordProgressionAnalyzerProps {
  currentNotes: string[];
}

export default function ChordProgressionAnalyzer({ 
  currentNotes
}: ChordProgressionAnalyzerProps) {
  const [key, setKey] = useState<string>('C');

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-white text-xl mb-4">Note Display</h3>
      
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
      </div>
      
      <div className="mb-4">
        <h4 className="text-white text-lg mb-2">Current Notes:</h4>
        <div className="bg-gray-700 p-3 rounded text-white text-xl font-bold">
          {currentNotes.length > 0 ? currentNotes.join(', ') : 'Play some notes...'}
        </div>
      </div>
    </div>
  );
}