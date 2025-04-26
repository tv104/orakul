import { useMousePosition } from "@/hooks";
import Image, { type StaticImageData } from "next/image";
import React, { type FC, useMemo } from "react";

interface ParallaxBackgroundProps {
  backgroundImage: StaticImageData;
  foregroundImage: StaticImageData;
}

const BG_FACTOR = 20;
const FG_FACTOR = 40;

const containerStyles = `fixed 
    left-[-${BG_FACTOR}px] 
    top-[-${BG_FACTOR}px] 
    right-[-${BG_FACTOR}px] 
    bottom-[-${BG_FACTOR}px]
`;

export const ParallaxBackground: FC<ParallaxBackgroundProps> = ({
  backgroundImage,
  foregroundImage,
}) => {
  const { x, y } = useMousePosition();

  const backgroundTransform = useMemo(() => {
    return `translate(${x * -BG_FACTOR}px, ${y * -BG_FACTOR}px)`;
  }, [x, y]);
  const foregroundTransform = useMemo(() => {
    return `translate(${x * -FG_FACTOR}px, ${y * -FG_FACTOR}px)`;
  }, [x, y]);

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
