'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

interface SynthProps {
  onNotePlay?: (note: string, velocity: number) => void;
}

type SynthType = 
  | 'AMSynth'
  | 'DuoSynth'
  | 'FMSynth'
  | 'MembraneSynth'
  | 'MetalSynth'
  | 'MonoSynth'
  | 'NoiseSynth'
  | 'PluckSynth'
  | 'PolySynth'
  | 'Synth';

type EffectType = 
  | 'none'
  | 'AutoFilter'
  | 'AutoPanner'
  | 'AutoWah'
  | 'BitCrusher'
  | 'Chebyshev'
  | 'Chorus'
  | 'Compressor'
  | 'Convolver'
  | 'Delay'
  | 'Distortion'
  | 'EQ3'
  | 'FeedbackDelay'
  | 'Filter'
  | 'Freeverb'
  | 'FrequencyShifter'
  | 'Gate'
  | 'JCReverb'
  | 'Limiter'
  | 'MidSideCompressor'
  | 'MultibandCompressor'
  | 'Phaser'
  | 'PingPongDelay'
  | 'PitchShift'
  | 'Reverb'
  | 'StereoWidener'
  | 'Tremolo'
  | 'Vibrato';

export default function SynthComponent({ onNotePlay }: SynthProps) {
  const synthRef = useRef<any>(null);
  const effectRef = useRef<Tone.ToneAudioNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSynth, setSelectedSynth] = useState<SynthType>('Synth');
  const [selectedEffect, setSelectedEffect] = useState<EffectType>('none');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const initializeSynth = async () => {
      await Tone.start();
      
      synthRef.current = createSynth(selectedSynth);
      synthRef.current.toDestination();
      
      setIsInitialized(true);
    };

    initializeSynth();

    return () => {
      if (synthRef.current) {
        synthRef.current.disconnect();
        synthRef.current.dispose();
      }
      if (effectRef.current) {
        effectRef.current.disconnect();
        effectRef.current.dispose();
      }
    };
  }, [selectedSynth, isClient]);

  const synthOptions = [
    { value: 'AMSynth', label: 'AM Synth' },
    { value: 'DuoSynth', label: 'Duo Synth' },
    { value: 'FMSynth', label: 'FM Synth' },
    { value: 'MembraneSynth', label: 'Membrane Synth' },
    { value: 'MetalSynth', label: 'Metal Synth' },
    { value: 'MonoSynth', label: 'Mono Synth' },
    { value: 'NoiseSynth', label: 'Noise Synth' },
    { value: 'PluckSynth', label: 'Pluck Synth' },
    { value: 'PolySynth', label: 'Poly Synth' },
    { value: 'Synth', label: 'Basic Synth' }
  ];

  const effectOptions = [
    { value: 'none', label: 'No Effect' },
    { value: 'AutoFilter', label: 'Auto Filter' },
    { value: 'AutoPanner', label: 'Auto Panner' },
    { value: 'AutoWah', label: 'Auto Wah' },
    { value: 'BitCrusher', label: 'Bit Crusher' },
    { value: 'Chebyshev', label: 'Chebyshev Distortion' },
    { value: 'Chorus', label: 'Chorus' },
    { value: 'Compressor', label: 'Compressor' },
    { value: 'Convolver', label: 'Convolver' },
    { value: 'Delay', label: 'Delay' },
    { value: 'Distortion', label: 'Distortion' },
    { value: 'EQ3', label: 'EQ3' },
    { value: 'FeedbackDelay', label: 'Feedback Delay' },
    { value: 'Filter', label: 'Filter' },
    { value: 'Freeverb', label: 'Freeverb' },
    { value: 'FrequencyShifter', label: 'Frequency Shifter' },
    { value: 'Gate', label: 'Gate' },
    { value: 'JCReverb', label: 'JC Reverb' },
    { value: 'Limiter', label: 'Limiter' },
    { value: 'MidSideCompressor', label: 'Mid-Side Compressor' },
    { value: 'MultibandCompressor', label: 'Multiband Compressor' },
    { value: 'Phaser', label: 'Phaser' },
    { value: 'PingPongDelay', label: 'Ping Pong Delay' },
    { value: 'PitchShift', label: 'Pitch Shift' },
    { value: 'Reverb', label: 'Reverb' },
    { value: 'StereoWidener', label: 'Stereo Widener' },
    { value: 'Tremolo', label: 'Tremolo' },
    { value: 'Vibrato', label: 'Vibrato' }
  ];

  const createSynth = (synthType: SynthType): any => {
    switch (synthType) {
      case 'AMSynth':
        return new Tone.AMSynth();
      case 'DuoSynth':
        return new Tone.DuoSynth();
      case 'FMSynth':
        return new Tone.FMSynth();
      case 'MembraneSynth':
        return new Tone.MembraneSynth();
      case 'MetalSynth':
        return new Tone.MetalSynth();
      case 'MonoSynth':
        return new Tone.MonoSynth();
      case 'NoiseSynth':
        return new Tone.NoiseSynth();
      case 'PluckSynth':
        return new Tone.PluckSynth();
      case 'PolySynth':
        return new Tone.PolySynth();
      case 'Synth':
      default:
        return new Tone.Synth();
    }
  };

  const createEffect = (effectType: EffectType): Tone.ToneAudioNode | null => {
    switch (effectType) {
      case 'none':
        return null;
      case 'AutoFilter':
        return new Tone.AutoFilter();
      case 'AutoPanner':
        return new Tone.AutoPanner();
      case 'AutoWah':
        return new Tone.AutoWah();
      case 'BitCrusher':
        return new Tone.BitCrusher();
      case 'Chebyshev':
        return new Tone.Chebyshev();
      case 'Chorus':
        return new Tone.Chorus();
      case 'Compressor':
        return new Tone.Compressor();
      case 'Delay':
        return new Tone.Delay();
      case 'Distortion':
        return new Tone.Distortion();
      case 'EQ3':
        return new Tone.EQ3();
      case 'FeedbackDelay':
        return new Tone.FeedbackDelay();
      case 'Filter':
        return new Tone.Filter();
      case 'Freeverb':
        return new Tone.Freeverb();
      case 'FrequencyShifter':
        return new Tone.FrequencyShifter();
      case 'Gate':
        return new Tone.Gate();
      case 'JCReverb':
        return new Tone.JCReverb();
      case 'Limiter':
        return new Tone.Limiter();
      case 'MidSideCompressor':
        return new Tone.MidSideCompressor();
      case 'MultibandCompressor':
        return new Tone.MultibandCompressor();
      case 'Phaser':
        return new Tone.Phaser();
      case 'PingPongDelay':
        return new Tone.PingPongDelay();
      case 'PitchShift':
        return new Tone.PitchShift();
      case 'Reverb':
        return new Tone.Reverb();
      case 'StereoWidener':
        return new Tone.StereoWidener();
      case 'Tremolo':
        return new Tone.Tremolo();
      case 'Vibrato':
        return new Tone.Vibrato();
      default:
        return null;
    }
  };

  const playNote = useCallback((note: string, velocity: number = 1) => {
    if (!synthRef.current || !isInitialized) return;
    
    try {
      if (synthRef.current.triggerAttackRelease) {
        synthRef.current.triggerAttackRelease(note, '8n', undefined, velocity);
      }
      onNotePlay?.(note, velocity);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }, [isInitialized, onNotePlay]);

  const stopNote = useCallback(() => {
    if (!synthRef.current || !isInitialized) return;
    
    try {
      if (synthRef.current.triggerRelease) {
        synthRef.current.triggerRelease();
      }
    } catch (error) {
      console.error('Error stopping note:', error);
    }
  }, [isInitialized]);

  const playChord = useCallback((notes: string[]) => {
    if (!synthRef.current || !isInitialized) return;
    
    try {
      notes.forEach((note, index) => {
        setTimeout(() => {
          if (synthRef.current?.triggerAttackRelease) {
            synthRef.current.triggerAttackRelease(note, '2n');
          }
          // Add this line to notify the parent component about each note
          onNotePlay?.(note, 1);
        }, index * 50);
      });
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  }, [isInitialized, onNotePlay]);

  const updateSynth = (synthType: SynthType) => {
    if (synthRef.current) {
      synthRef.current.disconnect();
      synthRef.current.dispose();
    }

    synthRef.current = createSynth(synthType);
    
    if (selectedEffect === 'none') {
      synthRef.current.toDestination();
    } else if (effectRef.current) {
      synthRef.current.connect(effectRef.current);
    }

    setSelectedSynth(synthType);
  };

  const updateEffect = (effectType: EffectType) => {
    if (!synthRef.current) return;

    synthRef.current.disconnect();
    if (effectRef.current) {
      effectRef.current.dispose();
      effectRef.current = null;
    }

    if (effectType === 'none') {
      synthRef.current.toDestination();
    } else {
      effectRef.current = createEffect(effectType);
      if (effectRef.current) {
        synthRef.current.connect(effectRef.current);
        effectRef.current.toDestination();
      }
    }

    setSelectedEffect(effectType);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Synthesizer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Synthesizer Type
          </label>
          <select
            value={selectedSynth}
            onChange={(e) => updateSynth(e.target.value as SynthType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {synthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effect
          </label>
          <select
            value={selectedEffect}
            onChange={(e) => updateEffect(e.target.value as EffectType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {effectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Notes</h3>
        <div className="grid grid-cols-4 gap-2">
          {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((note) => (
            <button
              key={note}
              onClick={() => playNote(note)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={!isInitialized}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Chords</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => playChord(['C4', 'E4', 'G4'])}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            disabled={!isInitialized}
          >
            C Major
          </button>
          <button
            onClick={() => playChord(['D4', 'F#4', 'A4'])}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            disabled={!isInitialized}
          >
            D Major
          </button>
          <button
            onClick={() => playChord(['E4', 'G#4', 'B4'])}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            disabled={!isInitialized}
          >
            E Major
          </button>
          <button
            onClick={() => playChord(['F4', 'A4', 'C5'])}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            disabled={!isInitialized}
          >
            F Major
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>Status: {isInitialized ? 'Ready' : 'Initializing...'}</p>
        <p>Current Synth: {selectedSynth}</p>
        <p>Current Effect: {selectedEffect}</p>
      </div>
    </div>
  );
}