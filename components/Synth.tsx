'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import AudioVisualizer from './AudioVisualizer';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSynth, setSelectedSynth] = useState<SynthType>('Synth');
  const [selectedEffect, setSelectedEffect] = useState<EffectType>('none');
  const [isClient, setIsClient] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  
  // MIDI state
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [midiDevices, setMidiDevices] = useState<WebMidi.MIDIInput[]>([]);
  const [selectedMidiDevice, setSelectedMidiDevice] = useState<string>('');
  const [midiStatus, setMidiStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const synthRef = useRef<any>(null);
  const effectRef = useRef<any>(null);
  const activeNotesRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  // MIDI note number to note name conversion
  const midiNoteToNoteName = (midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${noteNames[noteIndex]}${octave}`;
  };

  // Initialize MIDI
  const initializeMIDI = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported');
      return;
    }

    try {
      setMidiStatus('connecting');
      const access = await navigator.requestMIDIAccess();
      setMidiAccess(access);
      
      const inputs = Array.from(access.inputs.values());
      setMidiDevices(inputs);
      
      if (inputs.length > 0) {
        setMidiStatus('connected');
        // Auto-select first device
        setSelectedMidiDevice(inputs[0].id);
        setupMIDIInput(inputs[0]);
      } else {
        setMidiStatus('disconnected');
      }

      // Listen for device changes
      access.onstatechange = () => {
        const newInputs = Array.from(access.inputs.values());
        setMidiDevices(newInputs);
        if (newInputs.length === 0) {
          setMidiStatus('disconnected');
          setSelectedMidiDevice('');
        }
      };
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
      setMidiStatus('disconnected');
    }
  }, []);

  // Setup MIDI input handling
  const setupMIDIInput = useCallback((input: WebMidi.MIDIInput) => {
    input.onmidimessage = (event) => {
      const [command, note, velocity] = event.data;
      const channel = command & 0xf;
      const messageType = command & 0xf0;

      if (messageType === 0x90 && velocity > 0) {
        // Note on
        const noteName = midiNoteToNoteName(note);
        const normalizedVelocity = velocity / 127;
        
        activeNotesRef.current.set(note, noteName);
        playMIDINote(noteName, normalizedVelocity);
      } else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
        // Note off
        const noteName = activeNotesRef.current.get(note);
        if (noteName) {
          activeNotesRef.current.delete(note);
          stopMIDINote(noteName);
        }
      }
    };
  }, []);

  // Play MIDI note
  const playMIDINote = useCallback((note: string, velocity: number) => {
    if (!isInitialized || !synthRef.current) return;

    try {
      if (synthRef.current.triggerAttack) {
        synthRef.current.triggerAttack(note, undefined, velocity);
      } else {
        synthRef.current.triggerAttackRelease(note, '8n', undefined, velocity);
      }
      
      onNotePlay?.(note, velocity);
      
      // Visual feedback
      setActiveKeys(prev => new Set([...prev, note]));
    } catch (error) {
      console.error('Error playing MIDI note:', error);
    }
  }, [isInitialized, onNotePlay]);

  // Stop MIDI note
  const stopMIDINote = useCallback((note: string) => {
    if (!isInitialized || !synthRef.current) return;

    try {
      if (synthRef.current.triggerRelease) {
        synthRef.current.triggerRelease(note);
      }
      
      // Remove visual feedback
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    } catch (error) {
      console.error('Error stopping MIDI note:', error);
    }
  }, [isInitialized]);

  // Handle MIDI device selection
  const handleMidiDeviceChange = (deviceId: string) => {
    setSelectedMidiDevice(deviceId);
    if (midiAccess && deviceId) {
      const device = midiAccess.inputs.get(deviceId);
      if (device) {
        setupMIDIInput(device);
      }
    }
  };

  useEffect(() => {
    if (!isClient) return;

    const initializeAudio = async () => {
      try {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        
        synthRef.current = createSynth(selectedSynth);
        synthRef.current.toDestination();
        setIsInitialized(true);
        
        // Initialize MIDI after audio is ready
        await initializeMIDI();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();

    return () => {
      if (synthRef.current) {
        synthRef.current.disconnect();
        synthRef.current.dispose();
      }
      if (effectRef.current) {
        effectRef.current.dispose();
      }
    };
  }, [isClient, selectedSynth, initializeMIDI]);

  const synthOptions = [
    { value: 'Synth', label: 'Basic Synth' },
    { value: 'AMSynth', label: 'AM Synth' },
    { value: 'DuoSynth', label: 'Duo Synth' },
    { value: 'FMSynth', label: 'FM Synth' },
    { value: 'MembraneSynth', label: 'Membrane Synth' },
    { value: 'MetalSynth', label: 'Metal Synth' },
    { value: 'MonoSynth', label: 'Mono Synth' },
    { value: 'NoiseSynth', label: 'Noise Synth' },
    { value: 'PluckSynth', label: 'Pluck Synth' },
    { value: 'PolySynth', label: 'Poly Synth' },
  ];

  const effectOptions = [
    { value: 'none', label: 'No Effect' },
    { value: 'AutoFilter', label: 'Auto Filter' },
    { value: 'AutoPanner', label: 'Auto Panner' },
    { value: 'AutoWah', label: 'Auto Wah' },
    { value: 'BitCrusher', label: 'Bit Crusher' },
    { value: 'Chebyshev', label: 'Chebyshev' },
    { value: 'Chorus', label: 'Chorus' },
    { value: 'Compressor', label: 'Compressor' },
    { value: 'Delay', label: 'Delay' },
    { value: 'Distortion', label: 'Distortion' },
    { value: 'Freeverb', label: 'Freeverb' },
    { value: 'Phaser', label: 'Phaser' },
    { value: 'PingPongDelay', label: 'Ping Pong Delay' },
    { value: 'Reverb', label: 'Reverb' },
    { value: 'Tremolo', label: 'Tremolo' },
    { value: 'Vibrato', label: 'Vibrato' },
  ];

  const createSynth = (synthType: SynthType) => {
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
      default:
        return new Tone.Synth();
    }
  };

  const createEffect = (effectType: EffectType) => {
    switch (effectType) {
      case 'AutoFilter':
        return new Tone.AutoFilter('4n').start();
      case 'AutoPanner':
        return new Tone.AutoPanner('4n').start();
      case 'AutoWah':
        return new Tone.AutoWah();
      case 'BitCrusher':
        return new Tone.BitCrusher(4);
      case 'Chebyshev':
        return new Tone.Chebyshev(50);
      case 'Chorus':
        return new Tone.Chorus(4, 2.5, 0.5);
      case 'Compressor':
        return new Tone.Compressor(-30, 3);
      case 'Delay':
        return new Tone.Delay(0.2);
      case 'Distortion':
        return new Tone.Distortion(0.8);
      case 'Freeverb':
        return new Tone.Freeverb();
      case 'Phaser':
        return new Tone.Phaser();
      case 'PingPongDelay':
        return new Tone.PingPongDelay('4n', 0.2);
      case 'Reverb':
        return new Tone.Reverb(1.5);
      case 'Tremolo':
        return new Tone.Tremolo(9, 0.75).start();
      case 'Vibrato':
        return new Tone.Vibrato();
      default:
        return null;
    }
  };

  const playNote = useCallback((note: string) => {
    if (!isInitialized || !synthRef.current) return;

    try {
      synthRef.current.triggerAttackRelease(note, '8n');
      onNotePlay?.(note, 1);
      
      // Visual feedback
      setActiveKeys(prev => new Set([...prev, note]));
      setTimeout(() => {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }, 200);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }, [isInitialized, onNotePlay]);

  const stopNote = useCallback((note: string) => {
    if (!isInitialized || !synthRef.current) return;

    try {
      if (synthRef.current.triggerRelease) {
        synthRef.current.triggerRelease(note);
      }
    } catch (error) {
      console.error('Error stopping note:', error);
    }
  }, [isInitialized]);

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

  // Piano keyboard layout - removed last 4 keys (F4, G4, A4, B4)
  const whiteKeys = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4'];
  const blackKeys = [
    { note: 'C#3', position: 1 },
    { note: 'D#3', position: 2 },
    { note: 'F#3', position: 4 },
    { note: 'G#3', position: 5 },
    { note: 'A#3', position: 6 },
    { note: 'C#4', position: 8 },
    { note: 'D#4', position: 9 },
    { note: 'F#4', position: 11 },
  ];

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">NUKE Synthesizer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Synthesizer Type
          </label>
          <select
            value={selectedSynth}
            onChange={(e) => updateSynth(e.target.value as SynthType)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            {synthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Effect
          </label>
          <select
            value={selectedEffect}
            onChange={(e) => updateEffect(e.target.value as EffectType)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            {effectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            MIDI Device
          </label>
          <select
            value={selectedMidiDevice}
            onChange={(e) => handleMidiDeviceChange(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            disabled={midiDevices.length === 0}
          >
            <option value="">No MIDI Device</option>
            {midiDevices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name || 'Unknown Device'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio Visualizer - Half size above keyboard */}
      <div className="mb-4">
        <div className="flex justify-center">
          <AudioVisualizer width={400} height={100} />
        </div>
      </div>

      {/* Piano Keyboard */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Piano Keyboard</h3>
        <div className="relative bg-gray-900 p-4 rounded-lg">
          <div className="relative flex">
            {/* White Keys */}
            {whiteKeys.map((note, index) => (
              <button
                key={note}
                onMouseDown={() => playNote(note)}
                onMouseUp={() => stopNote(note)}
                onMouseLeave={() => stopNote(note)}
                className={`
                  relative w-12 h-32 bg-white border-2 border-gray-400 
                  hover:bg-gray-100 active:bg-gray-200 transition-colors
                  flex items-end justify-center pb-2 text-xs font-medium text-gray-800
                  ${activeKeys.has(note) ? 'bg-blue-200' : ''}
                  ${index === 0 ? 'rounded-l-md' : ''}
                  ${index === whiteKeys.length - 1 ? 'rounded-r-md' : ''}
                `}
                disabled={!isInitialized}
              >
                {note}
              </button>
            ))}
            
            {/* Black Keys */}
            {blackKeys.map(({ note, position }) => (
              <button
                key={note}
                onMouseDown={() => playNote(note)}
                onMouseUp={() => stopNote(note)}
                onMouseLeave={() => stopNote(note)}
                className={`
                  absolute w-8 h-20 bg-gray-900 border border-gray-700
                  hover:bg-gray-800 active:bg-gray-700 transition-colors
                  flex items-end justify-center pb-1 text-xs font-medium text-white
                  rounded-b-md z-10
                  ${activeKeys.has(note) ? 'bg-blue-600' : ''}
                `}
                style={{ left: `${position * 48 - 16}px` }}
                disabled={!isInitialized}
              >
                {note.replace('3', '').replace('4', '').replace('5', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p>Status: {isInitialized ? 'Ready' : 'Initializing...'}</p>
        <p>Current Synth: {selectedSynth}</p>
        <p>Current Effect: {selectedEffect}</p>
        <p>MIDI Status: 
          <span className={`ml-1 ${
            midiStatus === 'connected' ? 'text-green-400' : 
            midiStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {midiStatus === 'connected' ? '🟢 Connected' : 
             midiStatus === 'connecting' ? '🟡 Connecting' : '🔴 Disconnected'}
          </span>
        </p>
        {selectedMidiDevice && (
          <p>Active MIDI Device: {midiDevices.find(d => d.id === selectedMidiDevice)?.name || 'Unknown'}</p>
        )}
      </div>
    </div>
  );
}