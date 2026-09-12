/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import * as THREE from "three";
import { useRef, useState, useEffect, memo, Suspense } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text,
} from "@react-three/drei";
import { easing } from "maath";

// Preload the 3D models downloaded from react-bits
if (typeof window !== "undefined") {
  useGLTF.preload("/assets/3d/lens.glb");
  useGLTF.preload("/assets/3d/cube.glb");
  useGLTF.preload("/assets/3d/bar.glb");
}

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&auto=format&fit=crop&q=80",
];

export interface FluidGlassProps {
  mode?: "lens" | "bar" | "cube";
  lensProps?: Record<string, unknown>;
  barProps?: Record<string, unknown>;
  cubeProps?: Record<string, unknown>;
  scale?: number;
  ior?: number;
  thickness?: number;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FluidGlass({
  mode = "lens",
  lensProps = {},
  barProps = {},
  cubeProps = {},
  backgroundColor = "#080808",
  textColor = "#ffffff",
  className = "",
  style,
  ...restProps
}: FluidGlassProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`relative w-full h-full min-h-[400px] overflow-hidden bg-background ${className}`.trim()}
        style={style}
      />
    );
  }

  const Wrapper = mode === "bar" ? Bar : mode === "cube" ? Cube : Lens;
  const rawOverrides = mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;

  const modeProps = {
    ...restProps,
    ...rawOverrides,
  };

  const navItems = (rawOverrides["navItems"] as Array<{ label: string; link: string }>) || [
    { label: "EXPLORE", link: "#forge" },
    { label: "SPEC", link: "#gap" },
    { label: "OPEN SOURCE", link: "#opensource" },
  ];

  return (
    <div
      className={`relative w-full h-full min-h-[400px] overflow-hidden ${className}`.trim()}
      style={style}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{ alpha: true, toneMapping: THREE.NoToneMapping }}
        style={{ backgroundColor }}
      >
        <Suspense fallback={null}>
          <ScrollControls damping={0.2} pages={3} distance={0.4}>
            {mode === "bar" && <NavItems items={navItems} textColor={textColor} />}
            <Wrapper modeProps={modeProps} backgroundColor={backgroundColor}>
              <Scroll>
                <Typography textColor={textColor} />
                <Images />
              </Scroll>
              <Scroll html />
              <Preload />
            </Wrapper>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}

interface ModeWrapperProps {
  children?: React.ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: Record<string, unknown> | undefined;
  backgroundColor?: string;
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  backgroundColor = "#080808",
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF(glb) as unknown as { nodes: Record<string, THREE.Mesh> };
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    if (geo) {
      geo.computeBoundingBox();
      if (geo.boundingBox) {
        geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
      }
    }
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom
      ? -v.height / 2 + 0.2
      : followPointer
        ? (pointer.y * v.height) / 2
        : 0;

    if (ref.current) {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
      if (modeProps["scale"] == null) {
        const maxWorld = v.width * 0.9;
        const desired = maxWorld / geoWidthRef.current;
        ref.current.scale.setScalar(Math.min(0.15, desired));
      }
    }

    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
  });

  const scale = (modeProps["scale"] as number | undefined) ?? 0.15;
  const ior = (modeProps["ior"] as number | undefined) ?? 1.15;
  const thickness = (modeProps["thickness"] as number | undefined) ?? 5;
  const anisotropy = (modeProps["anisotropy"] as number | undefined) ?? 0.01;
  const chromaticAberration = (modeProps["chromaticAberration"] as number | undefined) ?? 0.1;

  const targetGeometry = nodes[geometryKey]?.geometry;

  return (
    <>
      {createPortal(
        <>
          <mesh position={[0, 0, -5]} scale={[vp.width * 2, vp.height * 2, 1]}>
            <planeGeometry />
            <meshBasicMaterial color={backgroundColor} toneMapped={false} />
          </mesh>
          {children}
        </>,
        scene,
      )}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent toneMapped={false} />
      </mesh>
      {targetGeometry && (
        <mesh ref={ref} scale={scale} rotation-x={Math.PI / 2} geometry={targetGeometry}>
          <MeshTransmissionMaterial
            buffer={buffer.texture}
            ior={ior}
            thickness={thickness}
            anisotropy={anisotropy}
            chromaticAberration={chromaticAberration}
          />
        </mesh>
      )}
    </>
  );
});

function Lens({
  modeProps,
  ...p
}: {
  modeProps?: Record<string, unknown>;
  backgroundColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({
  modeProps,
  ...p
}: {
  modeProps?: Record<string, unknown>;
  backgroundColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({
  modeProps = {},
  ...p
}: {
  modeProps?: Record<string, unknown>;
  backgroundColor?: string;
  children?: React.ReactNode;
}) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: "#ffffff",
    attenuationColor: "#ffffff",
    attenuationDistance: 0.25,
  };
  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

interface NavItemsProps {
  items: Array<{ label: string; link: string }>;
  textColor: string;
}

function NavItems({ items, textColor }: NavItemsProps) {
  const group = useRef<THREE.Group>(null);
  const { viewport, camera } = useThree();
  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 },
  };

  const getDevice = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? "mobile" : w <= DEVICE.tablet.max ? "tablet" : "desktop";
  };

  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);
    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link || typeof window === "undefined") return;
    if (link.startsWith("#")) {
      window.location.hash = link;
    } else {
      window.location.href = link;
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef<THREE.Group>(null);
  const data = useScroll();
  const { height } = useThree((s) => s.viewport);

  useFrame(() => {
    if (!group.current || !data) return;
    const children = group.current.children as THREE.Mesh[];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child && "material" in child) {
        const mat = child.material as THREE.Material & { zoom?: number };
        if (mat && "zoom" in mat) {
          const factor = i < 2 ? 1 / 3 : 1 / 2;
          const rangeOffset = i < 2 ? 0 : 1.15 / 3;
          mat.zoom = 1 + data.range(rangeOffset, 1 / 3) * factor;
        }
      }
    }
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1]} url={IMAGE_URLS[0]!} />
      <Image position={[2, 0, 3]} scale={3} url={IMAGE_URLS[1]!} />
      <Image position={[-2.05, -height, 6]} scale={[1, 3]} url={IMAGE_URLS[2]!} />
      <Image position={[-0.6, -height, 9]} scale={[1, 2]} url={IMAGE_URLS[3]!} />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url={IMAGE_URLS[4]!} />
    </group>
  );
}

function Typography({ textColor }: { textColor: string }) {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 },
  };

  const getDevice = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    return w <= 639 ? "mobile" : w <= 1023 ? "tablet" : "desktop";
  };

  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color={textColor}
      anchorX="center"
      anchorY="middle"
    >
      CHAOS FORGE
    </Text>
  );
}

export default FluidGlass;
