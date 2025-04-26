import { useMousePosition } from "@/hooks";
import Image, { type StaticImageData } from "next/image";
import React, { type FC, useMemo, useRef, useEffect, useState } from "react";

interface ParallaxBackgroundProps {
  backgroundImage: StaticImageData;
  foregroundImage: StaticImageData;
}

const BG_FACTOR = 20;
const FG_FACTOR = 42;
const TRANSITION_SPEED = 0.1;

const containerStyles = `fixed left-[-20px] top-[-20px] right-[-20px] bottom-[-20px]`;

export const ParallaxBackground: FC<ParallaxBackgroundProps> = ({
  backgroundImage,
  foregroundImage,
}) => {
  // TODO fallback for touch devices
  const { x, y } = useMousePosition();
  const [smoothX, setSmoothX] = useState(0);
  const [smoothY, setSmoothY] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      setSmoothX((prev) => prev + (x - prev) * TRANSITION_SPEED);
      setSmoothY((prev) => prev + (y - prev) * TRANSITION_SPEED);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y]);

  const backgroundTransform = useMemo(() => {
    return `translate(${smoothX * -BG_FACTOR}px, ${smoothY * -BG_FACTOR}px)`;
  }, [smoothX, smoothY]);

  const foregroundTransform = useMemo(() => {
    return `translate(${smoothX * -FG_FACTOR}px, ${smoothY * -FG_FACTOR}px)`;
  }, [smoothX, smoothY]);

  return (
    <div className={containerStyles}>
      <Image
        src={backgroundImage}
        alt="background"
        fill
        className="object-cover will-change-transform"
        style={{ transform: backgroundTransform }}
      />
      <Image
        src={foregroundImage}
        alt="foreground"
        fill
        className="object-cover will-change-transform"
        style={{ transform: foregroundTransform }}
      />
    </div>
  );
};
