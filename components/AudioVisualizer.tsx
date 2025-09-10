'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
}

export default function AudioVisualizer({ 
  width = 800, 
  height = 300
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const setupAnalyzer = async () => {
      await Tone.start();
      
      // Create analyzer and connect to master output
      analyzerRef.current = new Tone.Analyser('fft', 1024);
      Tone.getDestination().connect(analyzerRef.current);
      
      const canvas = canvasRef.current;
      if (!canvas || !analyzerRef.current) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!analyzerRef.current) return;
        
        const dataArray = analyzerRef.current.getValue() as Float32Array;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw frequency bars
        const barWidth = width / dataArray.length * 2.5;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] + 140) * 2;
          
          const hue = (i / dataArray.length) * 360;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
        
        animationRef.current = requestAnimationFrame(draw);
      };
      
      draw();
    };

    setupAnalyzer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
      }
    };
  }, [width, height]);

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-600 rounded"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}