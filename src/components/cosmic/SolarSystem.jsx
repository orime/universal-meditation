import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

const PLANET_DATA = [
  { name: '水星', size: 0.15, distance: 8, speed: 0.048, color: 0x8c7853 },
  { name: '金星', size: 0.25, distance: 11, speed: 0.035, color: 0xffc649 },
  { name: '地球', size: 0.25, distance: 15, speed: 0.03, color: 0x6b93d6 },
  { name: '火星', size: 0.2, distance: 20, speed: 0.024, color: 0xc1440e },
  { name: '木星', size: 1.2, distance: 30, speed: 0.013, color: 0xd8ca9d },
  { name: '土星', size: 1.0, distance: 40, speed: 0.009, color: 0xfad5a5, ring: true },
  { name: '天王星', size: 0.4, distance: 50, speed: 0.006, color: 0x4fd0e7 },
  { name: '海王星', size: 0.4, distance: 60, speed: 0.005, color: 0x4b70dd },
];

export default function SolarSystem() {
  const sunRef = useRef();
  const planetsRef = useRef([]);
  const orbitsRef = useRef([]);
  
  // 创建轨道路径
  const orbitLines = useMemo(() => {
    return PLANET_DATA.map(planet => {
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * planet.distance,
          0,
          Math.sin(angle) * planet.distance
        ));
      }
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  // 太阳光晕粒子
  const sunParticles = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const radius = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // 太阳脉动效果
    if (sunRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      sunRef.current.scale.setScalar(pulse);
    }
    
    // 行星公转
    planetsRef.current.forEach((planet, index) => {
      if (planet) {
        const angle = time * PLANET_DATA[index].speed;
        planet.position.x = Math.cos(angle) * PLANET_DATA[index].distance;
        planet.position.z = Math.sin(angle) * PLANET_DATA[index].distance;
        
        // 行星自转
        planet.rotation.y = time * 0.1;
      }
    });
  });

  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.1} />
      
      {/* 太阳 - 占据99%的质量 */}
      <group ref={sunRef}>
        {/* 太阳主体 */}
        <mesh>
          <sphereGeometry args={[3.5, 64, 64]} />
          <meshBasicMaterial 
            color={0xffd700}
            emissive={0xffd700}
            emissiveIntensity={0.8}
          />
        </mesh>
        
        {/* 太阳光晕 */}
        <mesh>
          <sphereGeometry args={[4.2, 32, 32]} />
          <meshBasicMaterial 
            color={0xffa500}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* 太阳粒子效果 */}
        <Points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2000}
              array={sunParticles}
              itemSize={3}
            />
          </bufferGeometry>
          <PointMaterial 
            size={0.05}
            color={0xffff00}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </Points>
        
        {/* 太阳光芒 */}
        <pointLight 
          intensity={3}
          color={0xffd700}
          distance={100}
          decay={2}
        />
      </group>
      
      {/* 轨道线 */}
      {orbitLines.map((geometry, index) => (
        <line key={`orbit-${index}`}>
          <bufferGeometry attach="geometry" {...geometry} />
          <lineBasicMaterial 
            color={0x444444}
            transparent
            opacity={0.3}
          />
        </line>
      ))}
      
      {/* 行星系统 */}
      {PLANET_DATA.map((planet, index) => (
        <group key={planet.name} ref={el => planetsRef.current[index] = el}>
          {/* 行星本体 */}
          <mesh>
            <sphereGeometry args={[planet.size, 32, 32]} />
            <meshStandardMaterial color={planet.color} />
          </mesh>
          
          {/* 土星环 */}
          {planet.ring && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.size * 1.3, planet.size * 1.7, 32]} />
              <meshStandardMaterial 
                color={0xcccccc} 
                side={THREE.DoubleSide}
                transparent
                opacity={0.7}
              />
            </mesh>
          )}
          
          {/* 行星标签 */}
          <Text
            position={[0, planet.size + 0.8, 0]}
            fontSize={0.3}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            {planet.name}
          </Text>
        </group>
      ))}
      
      {/* 主标题 */}
      <Text
        position={[0, -15, 0]}
        fontSize={1.2}
        color="#FFD700"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        太阳系
      </Text>
      
      {/* 说明文字 */}
      <Text
        position={[0, -17, 0]}
        fontSize={0.5}
        color="#E6E6FA"
        anchorX="center"
        anchorY="middle"
      >
        太阳占整个太阳系质量的99.86%
      </Text>
      
      <Text
        position={[0, -18.5, 0]}
        fontSize={0.4}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
      >
        所有行星加起来不到1%
      </Text>
    </>
  );
}