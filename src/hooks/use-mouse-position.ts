"use client";
import { useEffect, useState } from "react";

export const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        // Calculate position from -0.5 to 0.5 (0 is center)
        const x = (clientX / innerWidth) - 0.5;
        const y = (clientY / innerHeight) - 0.5;
        
        setMousePosition({ x, y });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, []);

    return mousePosition;
}