'use client';

import React, { useRef, useEffect } from "react";

interface Vertex3D {
  x: number;
  y: number;
  z: number;
}

export function BuckyballCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;

    // Generate C60 Buckyball Vertices
    const phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    const rawVertices: Vertex3D[] = [];

    const generatePermutations = (a: number, b: number, c: number) => {
      const signs = [-1, 1];
      for (const sa of signs) {
        for (const sb of signs) {
          for (const sc of signs) {
            const va = a === 0 ? 0 : sa * a;
            const vb = b === 0 ? 0 : sb * b;
            const vc = c === 0 ? 0 : sc * c;

            // Cyclic permutations (x, y, z), (z, x, y), (y, z, x)
            rawVertices.push({ x: va, y: vb, z: vc });
            rawVertices.push({ x: vc, y: va, z: vb });
            rawVertices.push({ x: vb, y: vc, z: va });
          }
        }
      }
    };

    generatePermutations(0, 1.0, 3.0 * phi);
    generatePermutations(1.0, 2.0 + phi, 2.0 * phi);
    generatePermutations(phi, 2.0, 2.0 * phi + 1.0);

    // Deduplicate vertices
    const uniqueVertices: Vertex3D[] = [];
    const eps = 0.001;
    for (const v of rawVertices) {
      let exists = false;
      for (const u of uniqueVertices) {
        if (
          Math.abs(v.x - u.x) < eps &&
          Math.abs(v.y - u.y) < eps &&
          Math.abs(v.z - u.z) < eps
        ) {
          exists = true;
          break;
        }
      }
      if (!exists) uniqueVertices.push(v);
    }

    // Identify edges (distance ≈ 2.0)
    const edges: [number, number][] = [];
    const edgeDistTarget = 2.0;
    const distEps = 0.15;

    for (let i = 0; i < uniqueVertices.length; i++) {
      for (let j = i + 1; j < uniqueVertices.length; j++) {
        const dx = uniqueVertices[i].x - uniqueVertices[j].x;
        const dy = uniqueVertices[i].y - uniqueVertices[j].y;
        const dz = uniqueVertices[i].z - uniqueVertices[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (Math.abs(dist - edgeDistTarget) < distEps) {
          edges.push([i, j]);
        }
      }
    }

    const scale = 32;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      angleX += 0.004;
      angleY += 0.006;

      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

      // Project vertices
      const projected = uniqueVertices.map((v) => {
        // Rotate Y
        const x1 = v.x * cosY + v.z * sinY;
        const y1 = v.y;
        const z1 = -v.x * sinY + v.z * cosY;

        // Rotate X
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Perspective
        const fov = 400;
        const pz = z2 + 14;
        const px = (x2 * fov) / pz + cx;
        const py = (y2 * fov) / pz + cy;

        return { px, py, pz };
      });

      // Draw Edges
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        if (!p1 || !p2) return;

        const avgZ = (p1.pz + p2.pz) / 2;
        const alpha = Math.max(0.08, Math.min(0.4, 1.8 / (avgZ - 8)));

        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      });

      // Draw Vertices
      projected.forEach((p) => {
        const alpha = Math.max(0.1, Math.min(0.6, 2.0 / (p.pz - 8)));
        ctx.fillStyle = `rgba(29, 211, 176, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-30"
    />
  );
}