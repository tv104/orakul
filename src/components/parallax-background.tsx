"use client";
import { useMousePosition } from "@/hooks";
import Image, { type StaticImageData } from "next/image";
import React, {
  type FC,
  useMemo,
  useRef,
  useEffect,
  useState,
  memo,
} from "react";
import { SphericalText } from "./spherical-text";

interface ParallaxBackgroundProps {
  backgroundImage: StaticImageData;
  foregroundImage: StaticImageData;
}

const BG_FACTOR = 20;
const FG_FACTOR = 42;
const TRANSITION_SPEED = 0.1;

const containerStyles = `fixed inset-[-20px]`;

// prevents unnecessary re-renders
const MemoizedSphericalText = memo(SphericalText);

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

  const transforms = useMemo(() => {
    return {
      background: `translate(${smoothX * -BG_FACTOR}px, ${
        smoothY * -BG_FACTOR
      }px)`,
      foreground: `translate(${smoothX * -FG_FACTOR}px, ${
        smoothY * -FG_FACTOR
      }px)`,
    };
  }, [smoothX, smoothY]);

  return (
    <div className={containerStyles}>
      <Image
        src={backgroundImage}
        alt="background"
        fill
        sizes="100vw"
        quality={85}
        priority
        className="object-cover will-change-transform"
        style={{ transform: transforms.background }}
      />

      <div
        className="size-full flex flex-col will-change-transform justify-end align-center relative max-w-[1600px] mx-auto"
        style={{
          transform: transforms.foreground,
        }}
      >
        <Image
          src={foregroundImage}
          alt="foreground"
          sizes="100vw"
          quality={100}
          priority
          className="object-cover min-h-[600px] sm:min-h-[960px] md:min-h-[1024px] relative"
        />
        <div className="z-1 absolute inset-0 flex flex-col justify-end items-center">
          <div
            className={`rounded-full overflow-hidden 
              size-[240px] translate-y-[-150px] translate-x-[3px] 
              sm:size-[390px] sm:translate-y-[-235px] sm:translate-x-[3px]
              md:size-[410px] md:translate-y-[-254px] md:translate-x-[5px] 
              `}
          >
            <MemoizedSphericalText
              onReady={() => {
                console.log("ready");
              }}
            >
              .
            </MemoizedSphericalText>
          </div>
        </div>
      </div>
    </div>
  );
};
