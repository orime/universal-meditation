import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export default function CosmicBackground({ intensity = 1 }) {
  const starsRef = useRef();
  
  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.x = clock.getElapsedTime() * 0.01;
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <>
      <Stars
        ref={starsRef}
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      <ambientLight intensity={intensity * 0.2} color={0x4e3d8e} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={intensity} 
        color={0xffd700} 
        distance={100}
        decay={2}
      />
    </>
  );
}