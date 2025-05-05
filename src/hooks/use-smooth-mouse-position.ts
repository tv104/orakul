"use client";
import { useEffect, useRef, useState } from "react";

export const useSmoothMousePosition = () => {
  const [rawMousePosition, setRawMousePosition] = useState({ x: 0, y: 0 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate position from -0.5 to 0.5 (0 is center)
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;
      
      setRawMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    const animate = () => {
      setSmoothMousePosition((prev) => ({
        x: prev.x + (rawMousePosition.x - prev.x) * 0.1,
        y: prev.y + (rawMousePosition.y - prev.y) * 0.1,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rawMousePosition]);
  
  return smoothMousePosition;
};