"use client";

import { useRef, useEffect, useState } from "react";
import { Comment } from "@/types";

export default function QuoteImage({ comment, onClose }: { comment: Comment; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 800;
    const padding = 40;
    const lineHeight = 28;
    const maxWidth = width - padding * 2;

    ctx.font = "16px Menlo, Monaco, 'Courier New', monospace";

    const words = comment.content.split("");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const height = padding * 3 + lines.length * lineHeight + 60;

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#00ff41";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.fillStyle = "#00ff41";
    ctx.font = "bold 16px Menlo, Monaco, 'Courier New', monospace";
    ctx.fillText("ZianTT GuestBook // Packet Capture", padding, padding);

    ctx.strokeStyle = "#30363d";
    ctx.beginPath();
    ctx.moveTo(padding, padding + 10);
    ctx.lineTo(width - padding, padding + 10);
    ctx.stroke();

    ctx.fillStyle = "#c9d1d9";
    ctx.font = "16px Menlo, Monaco, 'Courier New', monospace";
    lines.forEach((line, i) => {
      ctx.fillText(line, padding, padding + 40 + i * lineHeight);
    });

    const footerY = height - padding;
    ctx.fillStyle = "#ffa657";
    ctx.font = "14px Menlo, Monaco, 'Courier New', monospace";
    ctx.fillText(`> ${comment.nickname}`, padding, footerY - 20);
    ctx.fillStyle = "#8b949e";
    ctx.font = "12px Menlo, Monaco, 'Courier New', monospace";
    ctx.fillText(new Date(comment.createdAt).toLocaleString("zh-CN"), padding, footerY);

    setDataUrl(canvas.toDataURL("image/png"));
  }, [comment]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `ziantt-quote-${comment.id}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="mt-4 border border-terminal-border bg-black p-4">
      <canvas ref={canvasRef} className="w-full max-w-full border border-terminal-border" />
      <div className="flex gap-2 mt-3">
        <button onClick={handleDownload} className="terminal-btn text-xs">
          Download PNG
        </button>
        <button
          onClick={onClose}
          className="terminal-btn text-xs border-terminal-red text-terminal-red hover:bg-terminal-red/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}
