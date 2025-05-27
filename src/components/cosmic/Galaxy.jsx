import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Galaxy() {
  const galaxyRef = useRef();
  const spiralArmsRef = useRef([]);
  
  // 创建银河系主体恒星分布
  const { positions, colors, sizes } = useMemo(() => {
    const count = 50000; // 使用5万个粒子代表3000亿颗恒星
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const colorInside = new THREE.Color('#ff6030');
    const colorOutside = new THREE.Color('#1b3984');
    const colorCore = new THREE.Color('#ffbb00');
    
    for (let i = 0; i < count; i++) {
      // 使用指数分布模拟真实银河系的恒星密度
      const radius = Math.pow(Math.random(), 0.5) * 50;
      const spinAngle = radius * 0.1 + Math.random() * 0.5;
      const branchAngle = ((i % 4) / 4) * Math.PI * 2;
      
      // 加入螺旋臂结构
      const angle = branchAngle + spinAngle;
      
      // 添加随机扰动
      const randomX = (Math.random() - 0.5) * radius * 0.1;
      const randomY = (Math.random() - 0.5) * radius * 0.05;
      const randomZ = (Math.random() - 0.5) * radius * 0.1;
      
      positions[i * 3] = Math.cos(angle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;
      
      // 根据距离中心的位置设置颜色
      const mixedColor = colorInside.clone();
      if (radius < 5) {
        // 银河系核心区域
        mixedColor.lerp(colorCore, 1 - radius / 5);
      } else {
        // 外围区域
        mixedColor.lerp(colorOutside, radius / 50);
      }
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
      
      // 恒星大小变化
      sizes[i] = Math.random() * 0.5 + 0.5;
    }
    
    return { positions, colors, sizes };
  }, []);
  
  // 创建银河系核心
  const coreGlow = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 3;
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
    
    if (galaxyRef.current) {
      // 缓慢旋转整个银河系
      galaxyRef.current.rotation.y = time * 0.01;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.05} />
      
      <group ref={galaxyRef}>
        {/* 银河系主体恒星 */}
        <Points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={colors.length / 3}
              array={colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={sizes.length}
              array={sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexColors={true}
            vertexShader={`
              attribute float size;
              varying vec3 vColor;
              
              void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = size * (300.0 / -mvPosition.z);
              }
            `}
            fragmentShader={`
              varying vec3 vColor;
              
              void main() {
                float strength = distance(gl_PointCoord, vec2(0.5));
                strength = 1.0 - strength;
                strength = pow(strength, 3.0);
                
                vec3 color = mix(vec3(0.0), vColor, strength);
                gl_FragColor = vec4(color, strength);
              }
            `}
          />
        </Points>
        
        {/* 银河系核心 */}
        <group>
          <Points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={coreGlow.length / 3}
                array={coreGlow}
                itemSize={3}
              />
            </bufferGeometry>
            <PointMaterial
              size={0.1}
              color={0xffbb00}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </Points>
          
          {/* 核心发光球 */}
          <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial 
              color={0xffbb00}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      </group>
      
      {/* 背景深空 */}
      <mesh>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial 
          color={0x000005}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 远景恒星背景 */}
      <Points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={10000}
            array={(() => {
              const bgPositions = new Float32Array(10000 * 3);
              for (let i = 0; i < 10000; i++) {
                const radius = 200 + Math.random() * 200;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                bgPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                bgPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                bgPositions[i * 3 + 2] = radius * Math.cos(phi);
              }
              return bgPositions;
            })()}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          size={0.5}
          color={0xffffff}
          transparent
          opacity={0.3}
        />
      </Points>
      
      {/* 标题文字 */}
      <Text
        position={[0, -30, 0]}
        fontSize={1.5}
        color="#FFD700"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        银河系
      </Text>
      
      <Text
        position={[0, -33, 0]}
        fontSize={0.6}
        color="#E6E6FA"
        anchorX="center"
        anchorY="middle"
      >
        包含约3000亿颗恒星
      </Text>
      
      <Text
        position={[0, -35, 0]}
        fontSize={0.5}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
      >
        直径约10万光年
      </Text>
    </>
  );
}