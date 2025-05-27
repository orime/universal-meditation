import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Universe() {
  const universeRef = useRef();
  const clusterRefs = useRef([]);
  
  // 创建星系团分布 - 模拟宇宙大尺度结构
  const { galaxyClusters, filaments } = useMemo(() => {
    const clusterCount = 1000; // 代表1500亿个星系的集群
    const galaxyClusters = [];
    const filaments = new Float32Array(20000 * 3);
    
    // 创建星系团
    for (let i = 0; i < clusterCount; i++) {
      const cluster = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 800,
          (Math.random() - 0.5) * 800,
          (Math.random() - 0.5) * 800
        ),
        size: Math.random() * 10 + 5,
        galaxyCount: Math.floor(Math.random() * 1000) + 100,
        color: new THREE.Color().setHSL(
          Math.random() * 0.1 + 0.1, // 偏橙黄色
          0.3 + Math.random() * 0.3,
          0.5 + Math.random() * 0.3
        )
      };
      
      galaxyClusters.push(cluster);
    }
    
    // 创建宇宙纤维结构 - 连接星系团的暗物质丝
    for (let i = 0; i < 10000; i++) {
      // 在两个随机星系团之间创建连接
      if (galaxyClusters.length > 1) {
        const cluster1 = galaxyClusters[Math.floor(Math.random() * galaxyClusters.length)];
        const cluster2 = galaxyClusters[Math.floor(Math.random() * galaxyClusters.length)];
        
        const t = Math.random();
        const pos = cluster1.position.clone().lerp(cluster2.position, t);
        
        // 添加一些扰动模拟纤维结构
        pos.add(new THREE.Vector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        ));
        
        filaments[i * 3] = pos.x;
        filaments[i * 3 + 1] = pos.y;
        filaments[i * 3 + 2] = pos.z;
      }
    }
    
    return { galaxyClusters, filaments };
  }, []);
  
  // 为每个星系团创建星系粒子
  const clusterParticles = useMemo(() => {
    return galaxyClusters.map(cluster => {
      const count = Math.min(cluster.galaxyCount, 500); // 限制粒子数量以保证性能
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      
      for (let i = 0; i < count; i++) {
        // 球形分布模拟星系团
        const radius = Math.pow(Math.random(), 0.7) * cluster.size;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // 颜色变化
        const colorVariation = cluster.color.clone();
        colorVariation.offsetHSL(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.3
        );
        
        colors[i * 3] = colorVariation.r;
        colors[i * 3 + 1] = colorVariation.g;
        colors[i * 3 + 2] = colorVariation.b;
        
        sizes[i] = Math.random() * 2 + 0.5;
      }
      
      return { positions, colors, sizes, cluster };
    });
  }, [galaxyClusters]);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (universeRef.current) {
      // 非常缓慢的旋转，体现宇宙的庄严
      universeRef.current.rotation.x = Math.sin(time * 0.001) * 0.1;
      universeRef.current.rotation.y = time * 0.002;
    }
    
    // 星系团的微妙运动
    clusterRefs.current.forEach((cluster, index) => {
      if (cluster) {
        cluster.rotation.y = time * 0.005 + index * 0.1;
        const pulse = 1 + Math.sin(time * 0.01 + index) * 0.05;
        cluster.scale.setScalar(pulse);
      }
    });
  });
  
  return (
    <>
      <ambientLight intensity={0.02} />
      
      <group ref={universeRef}>
        {/* 宇宙微波背景辐射效果 */}
        <mesh>
          <sphereGeometry args={[2000, 64, 64]} />
          <shaderMaterial
            side={THREE.BackSide}
            transparent
            uniforms={{
              time: { value: 0 }
            }}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float time;
              varying vec2 vUv;
              
              void main() {
                vec3 color = vec3(0.01, 0.005, 0.02);
                float noise = sin(vUv.x * 50.0) * sin(vUv.y * 50.0) * 0.5;
                color += noise * 0.01;
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>
        
        {/* 宇宙纤维结构 */}
        <Points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={filaments.length / 3}
              array={filaments}
              itemSize={3}
            />
          </bufferGeometry>
          <PointMaterial
            size={0.5}
            color={0x440066}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </Points>
        
        {/* 星系团 */}
        {clusterParticles.map((cluster, index) => (
          <group
            key={index}
            ref={el => clusterRefs.current[index] = el}
            position={cluster.cluster.position}
          >
            <Points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={cluster.positions.length / 3}
                  array={cluster.positions}
                  itemSize={3}
                />
                <bufferAttribute
                  attach="attributes-color"
                  count={cluster.colors.length / 3}
                  array={cluster.colors}
                  itemSize={3}
                />
                <bufferAttribute
                  attach="attributes-size"
                  count={cluster.sizes.length}
                  array={cluster.sizes}
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
                    gl_PointSize = size * (1000.0 / -mvPosition.z);
                  }
                `}
                fragmentShader={`
                  varying vec3 vColor;
                  
                  void main() {
                    float strength = distance(gl_PointCoord, vec2(0.5));
                    strength = 1.0 - strength;
                    strength = pow(strength, 2.0);
                    
                    vec3 color = mix(vec3(0.0), vColor, strength);
                    gl_FragColor = vec4(color, strength * 0.8);
                  }
                `}
              />
            </Points>
          </group>
        ))}
        
        {/* 远距离星系背景 */}
        <Points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50000}
              array={(() => {
                const bgPositions = new Float32Array(50000 * 3);
                for (let i = 0; i < 50000; i++) {
                  const radius = 1500 + Math.random() * 500;
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
            size={0.3}
            color={0xffffff}
            transparent
            opacity={0.1}
          />
        </Points>
      </group>
      
      {/* 标题文字 */}
      <Text
        position={[0, -100, 0]}
        fontSize={2}
        color="#FFD700"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        可观测宇宙
      </Text>
      
      <Text
        position={[0, -105, 0]}
        fontSize={0.8}
        color="#E6E6FA"
        anchorX="center"
        anchorY="middle"
      >
        包含约1500亿个星系
      </Text>
      
      <Text
        position={[0, -108, 0]}
        fontSize={0.6}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
      >
        直径约930亿光年
      </Text>
      
      <Text
        position={[0, -112, 0]}
        fontSize={0.5}
        color="#AAAAAA"
        anchorX="center"
        anchorY="middle"
      >
        我们只是宇宙中的一粒星尘
      </Text>
    </>
  );
}