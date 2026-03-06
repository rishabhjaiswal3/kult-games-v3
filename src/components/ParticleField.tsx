import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
  isNode: boolean;
  dataFlow: number;
}

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const particleCount = 100;
    const connectionDistance = 180;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < particleCount; i++) {
      const isNode = Math.random() < 0.15;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: isNode ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        isNode,
        dataFlow: Math.random(),
      });
    }

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections first
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.12;
            
            // Data flow animation along connections
            const flowPos = (time * 2 + particles[i].dataFlow * 10) % 1;
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            const flowOpacity = opacity * 2;
            gradient.addColorStop(Math.max(0, flowPos - 0.1), `hsla(270, 70%, 55%, ${opacity})`);
            gradient.addColorStop(flowPos, `hsla(270, 70%, 75%, ${flowOpacity})`);
            gradient.addColorStop(Math.min(1, flowPos + 0.1), `hsla(270, 70%, 55%, ${opacity})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = particles[i].isNode || particles[j].isNode ? 0.8 : 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const pulse = Math.sin(time * 3 + p.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = p.opacity * pulse;
        const currentSize = p.size * (p.isNode ? pulse * 0.4 + 0.8 : 1);

        if (p.isNode) {
          // AI Node - glowing hub
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
          glow.addColorStop(0, `hsla(270, 70%, 65%, ${currentOpacity})`);
          glow.addColorStop(0.5, `hsla(270, 70%, 55%, ${currentOpacity * 0.3})`);
          glow.addColorStop(1, `hsla(270, 70%, 55%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Inner bright core
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(270, 80%, 75%, ${currentOpacity})`;
          ctx.fill();

          // Pulsing ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize * 2.5 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(270, 70%, 55%, ${currentOpacity * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(270, 70%, 55%, ${currentOpacity})`;
          ctx.fill();
        }
      });

      // Scanning line effect
      const scanY = (Math.sin(time * 0.5) * 0.5 + 0.5) * canvas.height;
      const scanGradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGradient.addColorStop(0, `hsla(270, 70%, 55%, 0)`);
      scanGradient.addColorStop(0.5, `hsla(270, 70%, 55%, 0.03)`);
      scanGradient.addColorStop(1, `hsla(270, 70%, 55%, 0)`);
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 40, canvas.width, 80);

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default ParticleField;
