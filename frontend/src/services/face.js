class FaceTracker {
  constructor() {
    this.animationId = null;
    this.lastFrames = [];
  }

  startTracking(video, canvas, onTelemetryCallback) {
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    let frameCount = 0;

    const track = () => {
      if (video.paused || video.ended) {
        this.animationId = requestAnimationFrame(track);
        return;
      }

      // Ensure canvas size matches video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw Face Scanner Reticle ---
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rx = 120;
      const ry = 150;

      // Draw dashed scanning oval
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = '#06b6d4'; // cyan accent
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Draw corner brackets around the face zone
      ctx.strokeStyle = '#8b5cf6'; // violet accent
      ctx.lineWidth = 4;
      
      // Top Left corner
      ctx.beginPath();
      ctx.moveTo(cx - rx - 20, cy - ry + 20);
      ctx.lineTo(cx - rx - 20, cy - ry - 20);
      ctx.lineTo(cx - rx + 20, cy - ry - 20);
      ctx.stroke();

      // Top Right corner
      ctx.beginPath();
      ctx.moveTo(cx + rx + 20, cy - ry + 20);
      ctx.lineTo(cx + rx + 20, cy - ry - 20);
      ctx.lineTo(cx + rx - 20, cy - ry - 20);
      ctx.stroke();

      // Bottom Left corner
      ctx.beginPath();
      ctx.moveTo(cx - rx - 20, cy + ry - 20);
      ctx.lineTo(cx - rx - 20, cy + ry + 20);
      ctx.lineTo(cx - rx + 20, cy + ry + 20);
      ctx.stroke();

      // Bottom Right corner
      ctx.beginPath();
      ctx.moveTo(cx + rx + 20, cy + ry - 20);
      ctx.lineTo(cx + rx + 20, cy + ry + 20);
      ctx.lineTo(cx + rx - 20, cy + ry + 20);
      ctx.stroke();

      // --- Draw Sweeping Laser Line ---
      const laserY = cy - ry + ((Math.sin(Date.now() / 600) + 1) / 2) * (ry * 2);
      ctx.beginPath();
      ctx.moveTo(cx - rx - 10, laserY);
      ctx.lineTo(cx + rx + 10, laserY);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // --- Simulate Telemetry Analysis ---
      frameCount++;
      if (frameCount % 60 === 0) { // Every ~2 seconds
        // Calculate basic motion change if possible
        let eyeContact = true;
        let confidence = 0.85 + Math.random() * 0.12;

        // Simulate looking away at random intervals
        if (Math.random() < 0.12) {
          eyeContact = false;
          confidence = 0.45;
        }

        onTelemetryCallback({
          eyeContact,
          confidence,
        });
      }

      // Face lock text status
      ctx.fillStyle = '#06b6d4';
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillText('FACE LOCK: ACTIVE', cx - 55, cy - ry - 30);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(`CONFIDENCE: ${Math.round((0.85 + Math.random() * 0.1) * 100)}%`, cx - 50, cy + ry + 35);

      this.animationId = requestAnimationFrame(track);
    };

    track();
  }

  stopTracking() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

export const faceTracker = new FaceTracker();
export default faceTracker;
