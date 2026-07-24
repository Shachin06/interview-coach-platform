import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ stream }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Check for browser support
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; // Small size for responsive volume bars
    
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 15;
      const barWidth = (canvas.width / barCount) - 3;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        // Sample frequencies smoothly
        const percent = dataArray[Math.min(i * 2, bufferLength - 1)] / 255.0;
        const barHeight = Math.max(4, percent * canvas.height);

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#8b5cf6'); // Violet
        gradient.addColorStop(1, '#06b6d4'); // Cyan

        ctx.fillStyle = gradient;
        // Rounded bar effect
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        x += barWidth + 3;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream]);

  // Fallback visualizer when stream is not active
  return (
    <div className="flex h-full w-full items-center justify-between gap-1 bg-dark-950/40 border border-dark-700/40 rounded-lg px-4 py-2">
      <div className="text-xs text-slate-400 font-medium font-sans uppercase">Voice Level</div>
      {stream ? (
        <canvas
          ref={canvasRef}
          width={150}
          height={24}
          className="h-6 w-[150px] object-cover"
        />
      ) : (
        <div className="flex h-3 items-center gap-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-1.5 rounded-full bg-dark-700/60"
              style={{
                animation: `audio-pulse 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
