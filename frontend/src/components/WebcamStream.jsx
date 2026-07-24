import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles } from 'lucide-react';
import { faceTracker } from '../services/face';

export default function WebcamStream({ onTelemetry, isRecording }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
        setPermissionError(false);
      } catch (err) {
        console.error('Error opening camera/mic:', err);
        setPermissionError(true);
      }
    }

    startCamera();

    return () => {
      // Cleanup stream tracks
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      faceTracker.stopTracking();
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current && canvasRef.current && onTelemetry) {
      faceTracker.startTracking(videoRef.current, canvasRef.current, onTelemetry);
    }
    return () => {
      faceTracker.stopTracking();
    };
  }, [stream, onTelemetry]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-dark-700/60 bg-dark-900 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {permissionError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
          <CameraOff className="h-12 w-12 text-accent-rose animate-pulse" />
          <p className="font-semibold text-white">Webcam / Microphone Access Denied</p>
          <p className="text-xs max-w-sm">Please allow camera and microphone permissions in your browser settings to proceed with the interactive interview.</p>
        </div>
      ) : !stream ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
          <Camera className="h-10 w-10 text-accent-violet animate-spin" />
          <p className="text-sm">Configuring camera feed and security handshake...</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover scale-x-[-1]" // Mirror display
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none scale-x-[-1]" // Mirror canvas too
          />
          
          {/* Header Indicators */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              isRecording 
                ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30 animate-pulse' 
                : 'bg-dark-950/80 text-accent-cyan border border-dark-700/60'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isRecording ? 'bg-accent-rose' : 'bg-accent-cyan'}`} />
              {isRecording ? 'RECORDING' : 'CAMERA FEED'}
            </span>
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-dark-950/80 px-2.5 py-0.5 text-[10px] border border-dark-700/60 text-accent-violet font-semibold uppercase">
            <Sparkles className="h-3 w-3" />
            <span>AI Tracker Online</span>
          </div>
        </>
      )}
    </div>
  );
}
export { faceTracker }; // re-export
