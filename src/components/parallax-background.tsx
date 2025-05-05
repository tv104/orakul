"use client";
import Image, { type StaticImageData } from "next/image";
import React, { type FC, useMemo, memo, useCallback } from "react";
import { SphericalText } from "./spherical-text";
import { useOrakulContext } from "@/providers";
import { cn } from "@/utils";
import { useSmoothMousePosition, useTextAnimation } from "@/hooks";

interface ParallaxBackgroundProps {
  backgroundImage: StaticImageData;
  foregroundImage: StaticImageData;
}

const BG_FACTOR = 20;
const FG_FACTOR = 42;

const containerStyles = `fixed inset-[-20px]`;

// prevents unnecessary re-renders
const MemoizedSphericalText = memo(SphericalText);

export const ParallaxBackground: FC<ParallaxBackgroundProps> = ({
  backgroundImage,
  foregroundImage,
}) => {
  const { isLoading, outcomeIndex } = useOrakulContext();
  const { x, y } = useSmoothMousePosition();
  const { displayText, opacityClass, durationClass } = useTextAnimation(
    isLoading,
    outcomeIndex
  );

  const transforms = useMemo(() => {
    return {
      background: `translate(${x * -BG_FACTOR}px, ${y * -BG_FACTOR}px)`,
      foreground: `translate(${x * -FG_FACTOR}px, ${y * -FG_FACTOR}px)`,
    };
  }, [x, y]);

  const onReadyCallback = useCallback(() => {
    // TODO use this to preload the app
  }, []);

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
        className="size-full flex flex-col will-change-transform justify-end align-center relative max-w-[1600px] mx-auto translate-y-0 sm:translate-y-0 md:translate-y-20 xl2:translate-y-0"
        style={{
          transform: transforms.foreground,
        }}
      >
        <Image
          src={foregroundImage}
          alt="foreground"
          sizes="100vw"
          quality={85}
          priority
          className="object-cover min-h-[600px] sm:min-h-[960px] md:min-h-[1024px] relative"
        />
        <div className="z-1 absolute inset-0 flex justify-center items-end">
          <div
            className={cn(
              `rounded-full overflow-hidden transition-[filter,opacity] 
              size-[240px] translate-y-[-150px] translate-x-[3px] 
              sm:size-[390px] sm:translate-y-[-235px] sm:translate-x-[3px]
              md:size-[410px] md:translate-y-[-254px] md:translate-x-[5px]`,
              isLoading && "animate-hue-rotate",
              durationClass,
              opacityClass
            )}
          >
            <MemoizedSphericalText
              text={displayText}
              onReady={onReadyCallback}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
