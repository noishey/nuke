'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

interface SynthProps {
  onNotePlay?: (note: string, velocity: number) => void;
}

// Define proper types for effect parameters
interface EffectParams {
  [key: string]: number | string;
}

// Define proper types for synth parameters
interface SynthWithParams {
  harmonicity?: { value: number };
  modulationIndex?: { value: number };
  detune?: { value: number };
  filter?: {
    frequency: { value: number };
    Q: { value: number };
  };
}

type SynthType = 
  | 'fmsynth'
  | 'amsynth'
  | 'synth'
  | 'monosynth'
  | 'duosynth'
  | 'polysynth'
  | 'plucksynth'
  | 'metalsynth'
  | 'membranesynth'
  | 'noisesynth';

type EffectType = 
  | 'none'
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'distortion'
  | 'bitcrusher'
  | 'chebyshev'
  | 'feedbackdelay'
  | 'pingpongdelay'
  | 'phaser'
  | 'tremolo'
  | 'vibrato'
  | 'autowah'
  | 'compressor'
  | 'limiter'
  | 'gate'
  | 'eq3'
  | 'filter'
  | 'freeverb'
  | 'jcreverb'
  | 'stereowidener';

export default function SynthComponent({ onNotePlay }: SynthProps) {
  const synthRef = useRef<Tone.Synth | Tone.PolySynth | null>(null);
  const effectRef = useRef<Tone.ToneAudioNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [selectedSynth, setSelectedSynth] = useState<SynthType>('fmsynth');
  const [selectedEffect, setSelectedEffect] = useState<EffectType>('none');
  // Remove unused effectParams and setEffectParams

  const synthOptions = [
    { value: 'fmsynth', label: 'FM Synth' },
    { value: 'amsynth', label: 'AM Synth' },
    { value: 'synth', label: 'Basic Synth' },
    { value: 'monosynth', label: 'Mono Synth' },
    { value: 'duosynth', label: 'Duo Synth' },
    { value: 'polysynth', label: 'Poly Synth' },
    { value: 'plucksynth', label: 'Pluck Synth' },
    { value: 'metalsynth', label: 'Metal Synth' },
    { value: 'membranesynth', label: 'Membrane Synth' },
    { value: 'noisesynth', label: 'Noise Synth' }
  ];

  const effectOptions = [
    { value: 'none', label: 'No Effect' },
    { value: 'reverb', label: 'Reverb' },
    { value: 'delay', label: 'Delay' },
    { value: 'chorus', label: 'Chorus' },
    { value: 'distortion', label: 'Distortion' },
    { value: 'bitcrusher', label: 'BitCrusher' },
    { value: 'chebyshev', label: 'Chebyshev Distortion' },
    { value: 'feedbackdelay', label: 'Feedback Delay' },
    { value: 'pingpongdelay', label: 'Ping Pong Delay' },
    { value: 'phaser', label: 'Phaser' },
    { value: 'tremolo', label: 'Tremolo' },
    { value: 'vibrato', label: 'Vibrato' },
    { value: 'autowah', label: 'Auto Wah' },
    { value: 'compressor', label: 'Compressor' },
    { value: 'limiter', label: 'Limiter' },
    { value: 'gate', label: 'Gate' },
    { value: 'eq3', label: 'EQ3' },
    { value: 'filter', label: 'Filter' },
    { value: 'freeverb', label: 'Freeverb' },
    { value: 'jcreverb', label: 'JC Reverb' },
    { value: 'stereowidener', label: 'Stereo Widener' }
  ];

  const createSynth = (synthType: SynthType): Tone.Synth | Tone.PolySynth => {
    switch (synthType) {
      case 'fmsynth':
        return new Tone.FMSynth({
          harmonicity: 3,
          modulationIndex: 10,
          detune: 0,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.5, decay: 0.01, sustain: 1, release: 0.5 }
        });
      case 'amsynth':
        return new Tone.AMSynth({
          harmonicity: 2,
          detune: 0,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.5, decay: 0.01, sustain: 1, release: 0.5 }
        });
      case 'synth':
        return new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        });
      case 'monosynth':
        return new Tone.MonoSynth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 },
          filterEnvelope: { attack: 0.001, decay: 0.7, sustain: 0.1, release: 0.8, baseFrequency: 300, octaves: 4 }
        });
      case 'duosynth':
        return new Tone.DuoSynth({
          vibratoAmount: 0.5,
          vibratoRate: 5,
          harmonicity: 1.5,
          voice0: {
            volume: -10,
            portamento: 0,
            oscillator: { type: 'sine' },
            filterEnvelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 },
            envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 }
          },
          voice1: {
            volume: -10,
            portamento: 0,
            oscillator: { type: 'sine' },
            filterEnvelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 },
            envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 }
          }
        });
      case 'polysynth':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'fatsawtooth', count: 3, spread: 30 },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4, attackCurve: 'exponential' }
        });
      case 'plucksynth':
        return new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.7
        });
      case 'metalsynth':
        return new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        });
      case 'membranesynth':
        return new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
        });
      case 'noisesynth':
        return new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        });
      default:
        return new Tone.Synth();
    }
  };

  useEffect(() => {
    const initializeSynth = async () => {
      await Tone.start();
      
      // Create initial synthesizer
      synthRef.current = createSynth(selectedSynth);
      synthRef.current.toDestination();
      
      setIsInitialized(true);
    };

    initializeSynth();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (effectRef.current) {
        effectRef.current.dispose();
      }
    };
  }, [selectedSynth]); // Add selectedSynth dependency

  // MIDI Setup
  useEffect(() => {
    const setupMIDI = async () => {
      try {
        const access = await navigator.requestMIDIAccess();
        setMidiAccess(access);
        
        access.inputs.forEach((input) => {
          input.onmidimessage = handleMIDIMessage;
        });
      } catch (error) {
        console.log('MIDI access denied:', error);
      }
    };

    setupMIDI();
  }, [handleMIDIMessage]); // Add handleMIDIMessage dependency

  const updateSynth = (synthType: SynthType) => {
    if (synthRef.current) {
      synthRef.current.disconnect();
      synthRef.current.dispose();
    }

    // Create new synthesizer
    synthRef.current = createSynth(synthType);
    
    // Reconnect with current effect
    if (selectedEffect === 'none') {
      synthRef.current.toDestination();
    } else if (effectRef.current) {
      synthRef.current.connect(effectRef.current);
    }

    setSelectedSynth(synthType);
  };

  const createEffect = (effectType: EffectType): Tone.ToneAudioNode | null => {
    switch (effectType) {
      case 'none':
        return null;
      case 'reverb':
        return new Tone.Reverb({ decay: 2, wet: 0.3 });
      case 'delay':
        return new Tone.Delay({ delayTime: 0.25, feedback: 0.3, wet: 0.3 });
      case 'chorus':
        return new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.3 });
      case 'distortion':
        return new Tone.Distortion({ distortion: 0.4, wet: 0.5 });
      case 'bitcrusher':
        return new Tone.BitCrusher({ bits: 8, wet: 0.5 });
      case 'chebyshev':
        return new Tone.Chebyshev({ order: 50, wet: 0.5 });
      case 'feedbackdelay':
        return new Tone.FeedbackDelay({ delayTime: 0.125, feedback: 0.4, wet: 0.3 });
      case 'pingpongdelay':
        return new Tone.PingPongDelay({ delayTime: 0.25, feedback: 0.3, wet: 0.3 });
      case 'phaser':
        return new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 350, wet: 0.3 });
      case 'tremolo':
        return new Tone.Tremolo({ frequency: 10, depth: 0.5, wet: 0.5 });
      case 'vibrato':
        return new Tone.Vibrato({ frequency: 5, depth: 0.1, wet: 0.5 });
      case 'autowah':
        return new Tone.AutoWah({ baseFrequency: 100, octaves: 6, sensitivity: 0, Q: 2, gain: 2, follower: { attack: 0.3, release: 0.5 }, wet: 0.5 });
      case 'compressor':
        return new Tone.Compressor({ threshold: -30, ratio: 12, attack: 0.003, release: 0.25, knee: 30 });
      case 'limiter':
        return new Tone.Limiter({ threshold: -12 });
      case 'gate':
        return new Tone.Gate({ threshold: -30, smoothing: 0.1 });
      case 'eq3':
        return new Tone.EQ3({ low: 0, mid: 0, high: 0, lowFrequency: 400, highFrequency: 2500 });
      case 'filter':
        return new Tone.Filter({ frequency: 1000, type: 'lowpass', rolloff: -12, Q: 1, gain: 0 });
      case 'freeverb':
        return new Tone.Freeverb({ roomSize: 0.7, dampening: 3000, wet: 0.3 });
      case 'jcreverb':
        return new Tone.JCReverb({ roomSize: 0.5, wet: 0.3 });
      case 'stereowidener':
        return new Tone.StereoWidener({ width: 0.5 });
      default:
        return null;
    }
  };

  const updateEffect = (effectType: EffectType) => {
    if (!synthRef.current) return;

    // Disconnect current effect
    synthRef.current.disconnect();
    if (effectRef.current) {
      effectRef.current.dispose();
      effectRef.current = null;
    }

    // Create and connect new effect
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

  // Memoize handleMIDIMessage to fix dependency issue
  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    const [command, note, velocity] = message.data;
    
    if (command === 144 && velocity > 0) { // Note on
      const noteName = Tone.Frequency(note, 'midi').toNote();
      playNote(noteName, velocity / 127);
      onNotePlay?.(noteName, velocity / 127);
    } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
      const noteName = Tone.Frequency(note, 'midi').toNote();
      stopNote(noteName);
    }
  }, [onNotePlay]);

  useEffect(() => {
    const initializeSynth = async () => {
      await Tone.start();
      
      // Create initial synthesizer
      synthRef.current = createSynth(selectedSynth);
      synthRef.current.toDestination();
      
      setIsInitialized(true);
    };

    initializeSynth();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (effectRef.current) {
        effectRef.current.dispose();
      }
    };
  }, [selectedSynth]); // Add selectedSynth dependency

  // MIDI Setup
  useEffect(() => {
    const setupMIDI = async () => {
      try {
        const access = await navigator.requestMIDIAccess();
        setMidiAccess(access);
        
        access.inputs.forEach((input) => {
          input.onmidimessage = handleMIDIMessage;
        });
      } catch (error) {
        console.log('MIDI access denied:', error);
      }
    };

    setupMIDI();
  }, [handleMIDIMessage]); // Add handleMIDIMessage dependency

  const playNote = (note: string, velocity: number = 0.8) => {
    if (synthRef.current && isInitialized) {
      if ('triggerAttack' in synthRef.current) {
        synthRef.current.triggerAttack(note, undefined, velocity);
      } else if ('triggerAttackRelease' in synthRef.current) {
        synthRef.current.triggerAttackRelease(note, '8n', undefined, velocity);
      }
    }
  };

  // Fix unused parameter in stopNote
  const stopNote = () => {
    if (synthRef.current && isInitialized) {
      if ('triggerRelease' in synthRef.current) {
        synthRef.current.triggerRelease();
      }
    }
  };

  const stopAllNotes = () => {
    if (synthRef.current && isInitialized) {
      if ('triggerRelease' in synthRef.current) {
        synthRef.current.triggerRelease();
      } else if ('releaseAll' in synthRef.current) {
        // Type assertion with proper interface
        (synthRef.current as Tone.PolySynth).releaseAll();
      }
    }
  };

  // Fix updateEffectParam with proper typing
  const updateEffectParam = (param: string, value: number) => {
    if (effectRef.current) {
      const effect = effectRef.current as Record<string, unknown>;
      if (effect[param]) {
        const paramObj = effect[param] as { value?: number };
        if (paramObj && typeof paramObj === 'object' && 'value' in paramObj) {
          paramObj.value = value;
        } else {
          effect[param] = value;
        }
      }
    }
  };

  // Fix synth parameter updates with proper typing
  const renderSynthControls = () => {
    switch (selectedSynth) {
      case 'fmsynth':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white block mb-2">Harmonicity</label>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.1"
                defaultValue="3"
                onChange={(e) => {
                  if (synthRef.current && 'harmonicity' in synthRef.current) {
                    const synth = synthRef.current as SynthWithParams;
                    if (synth.harmonicity) {
                      synth.harmonicity.value = parseFloat(e.target.value);
                    }
                  }
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Modulation Index</label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                defaultValue="10"
                onChange={(e) => {
                  if (synthRef.current && 'modulationIndex' in synthRef.current) {
                    const synth = synthRef.current as SynthWithParams;
                    if (synth.modulationIndex) {
                      synth.modulationIndex.value = parseFloat(e.target.value);
                    }
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
        );
      case 'amsynth':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white block mb-2">Harmonicity</label>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.1"
                defaultValue="2"
                onChange={(e) => {
                  if (synthRef.current && 'harmonicity' in synthRef.current) {
                    const synth = synthRef.current as SynthWithParams;
                    if (synth.harmonicity) {
                      synth.harmonicity.value = parseFloat(e.target.value);
                    }
                  }
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Detune</label>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                defaultValue="0"
                onChange={(e) => {
                  if (synthRef.current && 'detune' in synthRef.current) {
                    const synth = synthRef.current as SynthWithParams;
                    if (synth.detune) {
                      synth.detune.value = parseFloat(e.target.value);
                    }
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
        );
      case 'filter':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white block mb-2">Cutoff</label>
              <input
                type="range"
                min="20"
                max="20000"
                step="1"
                defaultValue="1000"
                onChange={(e) => {
                  if (synthRef.current && 'filter' in synthRef.current) {
                    const synth = synthRef.current as SynthWithParams;
                    if (synth.filter) {
                      synth.filter.frequency.value = parseFloat(e.target.value);
                    }
                  }
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Resonance</label>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                defaultValue="1"
                onChange={(e) => {
                  if (synthRef.current && 'filter' in synthRef.current) {
                    const synth = synthRef.current as SynthWithParams;
                    if (synth.filter) {
                      synth.filter.Q.value = parseFloat(e.target.value);
                    }
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-gray-400 text-center py-4">
            No specific controls available for this synthesizer
          </div>
        );
    }
  };

  const renderEffectControls = () => {
    switch (selectedEffect) {
      case 'reverb':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white block mb-2">Decay</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                defaultValue="2"
                onChange={(e) => updateEffectParam('decay', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Wet</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.3"
                onChange={(e) => updateEffectParam('wet', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      case 'delay':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white block mb-2">Delay Time</label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                defaultValue="0.25"
                onChange={(e) => updateEffectParam('delayTime', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Feedback</label>
              <input
                type="range"
                min="0"
                max="0.95"
                step="0.01"
                defaultValue="0.3"
                onChange={(e) => updateEffectParam('feedback', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Wet</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.3"
                onChange={(e) => updateEffectParam('wet', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      case 'distortion':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white block mb-2">Distortion</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.4"
                onChange={(e) => updateEffectParam('distortion', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Wet</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.5"
                onChange={(e) => updateEffectParam('wet', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      case 'filter':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white block mb-2">Frequency</label>
              <input
                type="range"
                min="20"
                max="20000"
                step="1"
                defaultValue="1000"
                onChange={(e) => updateEffectParam('frequency', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Q</label>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                defaultValue="1"
                onChange={(e) => updateEffectParam('Q', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Type</label>
              <select
                onChange={(e) => updateEffectParam('type', e.target.value)}
                className="bg-gray-700 text-white p-2 rounded w-full"
                defaultValue="lowpass"
              >
                <option value="lowpass">Lowpass</option>
                <option value="highpass">Highpass</option>
                <option value="bandpass">Bandpass</option>
                <option value="notch">Notch</option>
              </select>
            </div>
          </div>
        );
      case 'tremolo':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white block mb-2">Frequency</label>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                defaultValue="10"
                onChange={(e) => updateEffectParam('frequency', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Depth</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.5"
                onChange={(e) => updateEffectParam('depth', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white block mb-2">Wet</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.5"
                onChange={(e) => updateEffectParam('wet', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-gray-400 text-center py-4">
            {selectedEffect === 'none' ? 'No effect selected' : 'Effect controls not available for this effect'}
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-white text-xl mb-4">Synthesizer</h3>
      
      {/* Synthesizer Selection */}
      <div className="mb-4 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-white text-lg mb-3">Synthesizer Type</h4>
        <div className="mb-4">
          <label className="text-white block mb-2">Select Synthesizer</label>
          <select
            value={selectedSynth}
            onChange={(e) => updateSynth(e.target.value as SynthType)}
            className="bg-gray-600 text-white p-2 rounded w-full"
          >
            {synthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Dynamic Synth Controls */}
        <div className="mb-4">
          {renderSynthControls()}
        </div>
      </div>
      
      {/* Effects Section */}
      <div className="mb-4 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-white text-lg mb-3">Effects</h4>
        
        <div className="mb-4">
          <label className="text-white block mb-2">Select Effect</label>
          <select
            value={selectedEffect}
            onChange={(e) => updateEffect(e.target.value as EffectType)}
            className="bg-gray-600 text-white p-2 rounded w-full"
          >
            {effectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Dynamic Effect Controls */}
        <div className="mb-4">
          {renderEffectControls()}
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => playNote('C4')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test C4
        </button>
        <button
          onClick={() => playChord(['C4', 'E4', 'G4'])}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Test C Major
        </button>
        <button
          onClick={stopAllNotes}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Stop All
        </button>
      </div>
      
      <div className="text-sm text-gray-300">
        Status: {isInitialized ? 'Ready' : 'Initializing...'}
        {midiAccess && <span className="ml-4">MIDI: Connected</span>}
        <span className="ml-4">Synth: {synthOptions.find(s => s.value === selectedSynth)?.label}</span>
        {selectedEffect !== 'none' && <span className="ml-4">Effect: {effectOptions.find(e => e.value === selectedEffect)?.label}</span>}
      </div>
    </div>
  );
}