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
  isPurple: boolean;
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
    const particleCount = 120;
    const connectionDistance = 180;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < particleCount; i++) {
      const isNode = Math.random() < 0.18;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: isNode ? Math.random() * 3.5 + 2 : Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        isNode,
        dataFlow: Math.random(),
        isPurple: Math.random() < 0.15,
      });
    }

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            
            const flowPos = (time * 2 + particles[i].dataFlow * 10) % 1;
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            const flowOpacity = opacity * 2.5;
            const isPurpleLine = particles[i].isPurple || particles[j].isPurple;
            const hue = isPurpleLine ? "270" : "195";
            const sat = isPurpleLine ? "80%" : "100%";

            gradient.addColorStop(Math.max(0, flowPos - 0.1), `hsla(${hue}, ${sat}, 50%, ${opacity})`);
            gradient.addColorStop(flowPos, `hsla(${hue}, ${sat}, 65%, ${flowOpacity})`);
            gradient.addColorStop(Math.min(1, flowPos + 0.1), `hsla(${hue}, ${sat}, 50%, ${opacity})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = particles[i].isNode || particles[j].isNode ? 1 : 0.5;
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
        const hue = p.isPurple ? 270 : 195;
        const sat = p.isPurple ? 80 : 100;

        if (p.isNode) {
          // Brighter glow for nodes
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 5);
          glow.addColorStop(0, `hsla(${hue}, ${sat}%, 65%, ${currentOpacity})`);
          glow.addColorStop(0.4, `hsla(${hue}, ${sat}%, 55%, ${currentOpacity * 0.4})`);
          glow.addColorStop(1, `hsla(${hue}, ${sat}%, 50%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${sat}%, 70%, ${currentOpacity})`;
          ctx.fill();

          // Outer ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize * 3 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${hue}, ${sat}%, 60%, ${currentOpacity * 0.25})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${sat}%, 60%, ${currentOpacity})`;
          ctx.fill();
        }
      });

      // Lightning flash effect — random horizontal lines
      if (Math.random() < 0.02) {
        const flashY = Math.random() * canvas.height;
        const flashGradient = ctx.createLinearGradient(0, flashY, canvas.width, flashY);
        flashGradient.addColorStop(0, "hsla(195, 100%, 60%, 0)");
        flashGradient.addColorStop(0.3, "hsla(195, 100%, 70%, 0.15)");
        flashGradient.addColorStop(0.5, "hsla(195, 100%, 80%, 0.25)");
        flashGradient.addColorStop(0.7, "hsla(195, 100%, 70%, 0.15)");
        flashGradient.addColorStop(1, "hsla(195, 100%, 60%, 0)");
        ctx.fillStyle = flashGradient;
        ctx.fillRect(0, flashY - 1, canvas.width, 2);
      }

      // Scanning line effect — brighter
      const scanY = (Math.sin(time * 0.5) * 0.5 + 0.5) * canvas.height;
      const scanGradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      scanGradient.addColorStop(0, "hsla(195, 100%, 50%, 0)");
      scanGradient.addColorStop(0.5, "hsla(195, 100%, 60%, 0.06)");
      scanGradient.addColorStop(1, "hsla(195, 100%, 50%, 0)");
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 50, canvas.width, 100);

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
      style={{ opacity: 0.8 }}
    />
  );
};

export default ParticleField;
