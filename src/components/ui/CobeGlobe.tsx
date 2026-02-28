import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function CobeGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.2],
      markerColor: [0.1, 0.6, 1],
      glowColor: [0.1, 0.3, 0.8],
      markers: [
        // Fake locations for global threat blocked visualisation
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.05 },
        { location: [51.5074, -0.1278], size: 0.04 },
        { location: [35.6895, 139.6917], size: 0.05 },
        { location: [37.5665, 126.978], size: 0.07 }, // Seoul Central
        { location: [-33.8688, 151.2093], size: 0.04 },
        { location: [1.3521, 103.8198], size: 0.05 },
        { location: [48.8566, 2.3522], size: 0.03 },
      ],
      onRender: (state) => {
        // Automatically rotate the globe
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className={cn("flex justify-center items-center w-full max-w-[600px] aspect-square mx-auto", className)}>
      <canvas
        ref={canvasRef}
        style={{
          width: 600,
          height: 600,
          maxWidth: "100%",
          aspectRatio: "1/1",
          contain: "layout paint size",
          opacity: 0.8,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
