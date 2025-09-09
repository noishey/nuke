  const playNote = (note: string, velocity: number = 0.8) => {
    if (synthRef.current && isInitialized) {
      if ('triggerAttack' in synthRef.current) {
        synthRef.current.triggerAttack(note, undefined, velocity);
      } else if ('triggerAttackRelease' in synthRef.current) {
        synthRef.current.triggerAttackRelease(note, '8n', undefined, velocity);
      }
      // Add this line to notify the chord analyzer
      onNotePlay?.(note, velocity);
    }
  };

  // ... existing code ...

  const playChord = (notes: string[]) => {
    if (synthRef.current && 'triggerAttackRelease' in synthRef.current) {
      // For PolySynth, play all notes simultaneously
      if (selectedSynth === 'polysynth') {
        (synthRef.current as Tone.PolySynth).triggerAttackRelease(notes, '2n');
        // Notify chord analyzer for all notes
        notes.forEach(note => onNotePlay?.(note, 0.8));
      } else {
        // For other synths, arpeggiate
        notes.forEach((note, index) => {
          setTimeout(() => {
            playNote(note);
            // onNotePlay is already called in playNote function
          }, index * 50);
        });
      }
    } else {
      // Fallback for synths that don't support chords
      notes.forEach((note, index) => {
        setTimeout(() => {
          playNote(note);
          // onNotePlay is already called in playNote function
        }, index * 50);
      });
    }
  };