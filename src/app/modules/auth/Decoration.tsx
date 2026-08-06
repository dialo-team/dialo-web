import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei"; // Bỏ shaderMaterial
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

const noise3D = createNoise3D();

const Decoration = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);

    const positionAttribute = geo.getAttribute("position");
    geo.userData.originalPositions = positionAttribute.array.slice();
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positions = geometry.getAttribute("position");
    const originals = geometry.userData.originalPositions;

    for (let i = 0; i < originals.length; i += 3) {
      const x = originals[i];
      const y = originals[i + 1];
      const z = originals[i + 2];

      const noise = noise3D(
        x * 0.5 + time * 0.2,
        y * 0.5 + time * 0.2,
        z * 0.5,
      );
      const spike = Math.max(0, noise * 1.5);
      const scale = 1 + spike;

      positions.array[i] = x * scale;
      positions.array[i + 1] = y * scale;
      positions.array[i + 2] = z * scale;
    }

    positions.needsUpdate = true;
  });

  const wireframeColor = "#001BB7";

  return (
    <group scale={[2, 1, 2]}>
      {/* LỚP 1: DÂY */}
      <mesh geometry={geometry}>
        <meshBasicMaterial wireframe={true} color={wireframeColor} />
      </mesh>

      {/* LỚP 2: HẠT */}
      <points geometry={geometry}>
        <PointMaterial
          color={wireframeColor}
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </points>

      {/* LỚP 3: MẶT  */}
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#0046FF"
          flatShading={true}
          metalness={0.5}
          reflectivity={1}
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default Decoration;
