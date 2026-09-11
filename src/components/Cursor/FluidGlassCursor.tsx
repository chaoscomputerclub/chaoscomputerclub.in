import * as THREE from "three";
import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { easing } from "maath";

export interface FluidGlassCursorProps {
  scale?: number;
  ior?: number;
  thickness?: number;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  accentColor?: string;
  showCenterReticle?: boolean;
}

function LensModel({
  scale = 0.25,
  ior = 1.15,
  thickness = 2,
  transmission = 1,
  roughness = 0,
  chromaticAberration = 0.05,
  anisotropy = 0.01,
  accentColor = "#ccff00",
  isHovered = false,
}: {
  scale?: number;
  ior?: number;
  thickness?: number;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  accentColor?: string;
  isHovered?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF("/assets/3d/lens.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const { viewport, camera } = useThree();
  const prevPos = useRef<[number, number]>([0, 0]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { pointer } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const destX = (pointer.x * v.width) / 2;
    const destY = (pointer.y * v.height) / 2;

    // Smooth inertia tracking
    easing.damp3(ref.current.position, [destX, destY, 15], 0.12, delta);

    // Calculate velocity for subtle 3D optical tilt
    const vx = destX - prevPos.current[0];
    const vy = destY - prevPos.current[1];
    prevPos.current = [destX, destY];

    const targetRotX = Math.PI / 2 - vy * 0.15;
    const targetRotY = vx * 0.15;
    easing.damp(ref.current.rotation, "x", targetRotX, 0.15, delta);
    easing.damp(ref.current.rotation, "y", targetRotY, 0.15, delta);

    // Hover expansion
    const targetScale = isHovered ? scale * 1.25 : scale;
    easing.damp(ref.current.scale, "x", targetScale, 0.15, delta);
    easing.damp(ref.current.scale, "y", targetScale, 0.15, delta);
    easing.damp(ref.current.scale, "z", targetScale, 0.15, delta);
  });

  const geometry = nodes["Cylinder"]?.geometry;
  if (!geometry) return null;

  return (
    <mesh ref={ref} scale={scale} rotation-x={Math.PI / 2} geometry={geometry}>
      <MeshTransmissionMaterial
        ior={ior}
        thickness={thickness}
        transmission={transmission}
        roughness={roughness}
        chromaticAberration={isHovered ? chromaticAberration * 1.8 : chromaticAberration}
        anisotropy={anisotropy}
        color="#f2f2ee"
        attenuationColor={accentColor}
        attenuationDistance={1.4}
        distortion={0.12}
        distortionScale={0.15}
        temporalDistortion={0.05}
      />
    </mesh>
  );
}

export function FluidGlassCursor({
  scale = 0.25,
  ior = 1.15,
  thickness = 2,
  transmission = 1,
  roughness = 0,
  chromaticAberration = 0.05,
  anisotropy = 0.01,
  accentColor = "#ccff00",
  showCenterReticle = true,
}: FluidGlassCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100, visible: false });

  useEffect(() => {
    // Only enable on client and pointer-fine devices (desktops/mice)
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    setMounted(true);

    const handlePointerMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY, visible: true });

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest("a, button, [role='button'], input, textarea, select");
        setIsHovered(!!interactive);
      }
    };

    const handlePointerLeave = () => {
      setPos((p) => ({ ...p, visible: false }));
      setIsHovered(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  if (!mounted || !pos.visible) return null;

  return (
    <>
      {/* Real-time optical refraction & contrast ring on the DOM */}
      <div
        className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,border-color] duration-200 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          width: isHovered ? 84 : 64,
          height: isHovered ? 84 : 64,
          backdropFilter: "contrast(1.18) brightness(1.08) blur(0.3px)",
          WebkitBackdropFilter: "contrast(1.18) brightness(1.08) blur(0.3px)",
          boxShadow: isHovered
            ? "0 0 25px rgba(204,255,0,0.22), inset 0 0 15px rgba(255,255,255,0.12)"
            : "0 0 16px rgba(204,255,0,0.12), inset 0 0 10px rgba(255,255,255,0.06)",
          border: isHovered ? "1px solid rgba(204,255,0,0.4)" : "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {showCenterReticle && (
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="h-1.5 w-1.5 rounded-full transition-transform duration-150"
              style={{
                backgroundColor: accentColor,
                transform: isHovered ? "scale(1.5)" : "scale(1)",
                boxShadow: `0 0 6px ${accentColor}`,
              }}
            />
          </div>
        )}
      </div>

      {/* 3D WebGL Fluid Glass Canvas */}
      <div className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 20], fov: 15 }}
          gl={{ alpha: true, toneMapping: THREE.NoToneMapping }}
          style={{ pointerEvents: "none" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 10]} intensity={1.2} />
            <pointLight position={[-5, -5, 5]} intensity={0.6} color={accentColor} />
            <LensModel
              scale={scale}
              ior={ior}
              thickness={thickness}
              transmission={transmission}
              roughness={roughness}
              chromaticAberration={chromaticAberration}
              anisotropy={anisotropy}
              accentColor={accentColor}
              isHovered={isHovered}
            />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

export default FluidGlassCursor;
