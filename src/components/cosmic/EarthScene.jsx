import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function EarthScene() {
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const cloudsRef = useRef();
  
  // 程序化生成地球纹理
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // 创建地球表面的基础颜色
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#87CEEB'); // 天蓝色
    gradient.addColorStop(0.3, '#4169E1'); // 皇家蓝
    gradient.addColorStop(0.7, '#228B22'); // 森林绿
    gradient.addColorStop(1, '#8B4513'); // 棕色
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    
    // 添加大陆轮廓
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const w = Math.random() * 100 + 50;
      const h = Math.random() * 50 + 25;
      ctx.fillRect(x, y, w, h);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 程序化生成云层纹理
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 512, 256);
    
    // 生成云层
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const radius = Math.random() * 30 + 10;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.06;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <>
      {/* 环境光照 */}
      <ambientLight intensity={0.3} color={0x404040} />
      <directionalLight 
        position={[10, 5, 5]} 
        intensity={1.5} 
        color={0xffffff}
        castShadow
      />
      
      {/* 主地球 */}
      <mesh ref={earthRef} receiveShadow castShadow>
        <sphereGeometry args={[3, 64, 64]} />
        <meshLambertMaterial map={earthTexture} />
      </mesh>
      
      {/* 云层 */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[3.05, 64, 64]} />
        <meshLambertMaterial 
          map={cloudTexture} 
          transparent 
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
      
      {/* 大气层效果 */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[3.3, 64, 64]} />
        <meshBasicMaterial 
          color={0x87CEEB} 
          transparent 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 背景星空 */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial 
          color={0x000011} 
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 标题文字 */}
      <Text
        position={[0, -5, 0]}
        fontSize={0.8}
        color="#FFD700"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        地球 - 你的家园
      </Text>
      
      <Text
        position={[0, -6, 0]}
        fontSize={0.4}
        color="#E6E6FA"
        anchorX="center"
        anchorY="middle"
      >
        感受你与这个蓝色星球的连接
      </Text>
    </>
  );
}