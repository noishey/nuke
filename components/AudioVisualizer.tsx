'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  type?: 'frequency' | 'waveform' | 'circular';
}

export default function AudioVisualizer({ 
  width = 800, 
  height = 300, 
  type = 'frequency' 
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const setupAnalyzer = async () => {
      await Tone.start();
      
      // Create analyzer and connect to master output
      analyzerRef.current = new Tone.Analyser('fft', 1024);
      Tone.getDestination().connect(analyzerRef.current);
      
      setIsActive(true);
      
      // Move startVisualization logic directly inside useEffect
      const canvas = canvasRef.current;
      if (!canvas || !analyzerRef.current) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!analyzerRef.current) return;
        
        const dataArray = analyzerRef.current.getValue() as Float32Array;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        switch (type) {
          case 'frequency':
            drawFrequencyBars(ctx, dataArray);
            break;
          case 'waveform':
            drawWaveform(ctx, dataArray);
            break;
          case 'circular':
            drawCircularVisualizer(ctx, dataArray);
            break;
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
  }, [width, height, type, isClient]);

  if (!isClient) {
    return (
      <div 
        className="bg-black rounded-lg flex items-center justify-center text-white"
        style={{ width, height }}
      >
        Loading visualizer...
      </div>
    );
  }

  const drawFrequencyBars = (ctx: CanvasRenderingContext2D, dataArray: Float32Array) => {
    const barWidth = width / dataArray.length * 2.5;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] + 140) * 2; // Convert dB to pixel height
      
      const hue = (i / dataArray.length) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, dataArray: Float32Array) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    
    const sliceWidth = width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] + 140) / 280; // Normalize
      const y = v * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  };

  const drawCircularVisualizer = (ctx: CanvasRenderingContext2D, dataArray: Float32Array) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2;
      const amplitude = (dataArray[i] + 140) / 140;
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + amplitude * 50);
      const y2 = centerY + Math.sin(angle) * (radius + amplitude * 50);
      
      const hue = (i / dataArray.length) * 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-white text-xl mb-4">Audio Visualizer</h3>
      
      <div className="mb-4">
        <label className="text-white block mb-2">Visualization Type:</label>
        <select 
          value={type} 
          onChange={() => window.location.reload()} // Remove unused 'e' parameter
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="frequency">Frequency Bars</option>
          <option value="waveform">Waveform</option>
          <option value="circular">Circular</option>
        </select>
      </div>
      
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-600 rounded"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="text-sm text-gray-300 mt-2">
        Status: {isActive ? 'Active' : 'Initializing...'}
      </div>
    </div>
  );
}