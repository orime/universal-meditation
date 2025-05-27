import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// 地球组件
function Earth({ visible, userControl }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const glowRef = useRef();
  
  // 加载纹理
  const textures = useTexture({
    map: '/textures/earth_daymap.jpg',
    cloudsMap: '/textures/earth_clouds.png',
  });

  // 调整纹理设置
  useEffect(() => {
    if (textures.map) {
      textures.map.wrapS = THREE.RepeatWrapping;
      textures.map.wrapT = THREE.RepeatWrapping;
      textures.map.anisotropy = 16;
      textures.map.encoding = THREE.sRGBEncoding;
    }
  }, [textures]);

  // 移动端检测
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // 地球大小调整（在移动端显示更小一些）
  const earthSize = isMobile ? 4 : 5;
  const earthDetail = isMobile ? 48 : 64; // 移动端降低细节级别提高性能
  
  // 地球自转动画
  useFrame(({ clock }) => {
    if (earthRef.current && visible) {
      // 负值使地球向左侧旋转，根据用户控制模式决定是否自动旋转
      if (!userControl) {
        earthRef.current.rotation.y = -clock.getElapsedTime() * 0.05;
      }
    }
    if (cloudsRef.current && visible) {
      // 云层也向左侧旋转，速度略快
      if (!userControl) {
        cloudsRef.current.rotation.y = -clock.getElapsedTime() * 0.06;
      }
    }
    if (atmosphereRef.current && visible) {
      // 大气层轻微脉动
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.02 + 1.08;
      atmosphereRef.current.scale.set(pulse, pulse, pulse);
    }
    if (glowRef.current && visible) {
      // 光晕轻微脉动
      const glowPulse = Math.sin(clock.getElapsedTime() * 0.3) * 0.05 + 1.6;
      glowRef.current.scale.set(glowPulse, glowPulse, glowPulse);
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* 地球主体 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[earthSize, earthDetail, earthDetail]} />
        <meshStandardMaterial
          map={textures.map}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      
      {/* 云层 */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[earthSize, earthDetail, earthDetail]} />
        <meshStandardMaterial
          alphaMap={textures.cloudsMap}
          transparent={true}
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      
      {/* 大气层 */}
      <mesh ref={atmosphereRef} scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[earthSize, earthDetail, earthDetail]} />
        <meshStandardMaterial
          color="#4169E1"
          transparent={true}
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 光晕效果 */}
      <mesh ref={glowRef} scale={[1.6, 1.6, 1.6]}>
        <sphereGeometry args={[earthSize, 32, 32]} />
        <meshBasicMaterial
          color="#77ccff"
          transparent={true}
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// 太阳系组件
function SolarSystem({ visible, opacity = 1, userControl }) {
  const sunRef = useRef();
  const orbitsRef = useRef([]);
  const planetsRef = useRef([]);
  const backgroundStarsRef = useRef();
  
  // 检测移动端
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // 在移动端缩小比例以便看到更多行星
  const scaleFactor = isMobile ? 0.7 : 1;
  
  // 定义行星数据 - 包含所有八大行星
  const planets = [
    { name: "太阳", radius: 2.5, distance: 0, color: '#E4A752', speed: 0.6, size: 2.5 * scaleFactor },
    { name: "水星", radius: 0.4, distance: 10 * scaleFactor, color: '#C0C0C0', speed: 1.2, size: 0.6 * scaleFactor },
    { name: "金星", radius: 0.9, distance: 18 * scaleFactor, color: '#E6C229', speed: 0.9, size: 0.9 * scaleFactor },
    { name: "地球", radius: 1.0, distance: 26 * scaleFactor, color: '#6CA6CD', speed: 0.8, size: 1.0 * scaleFactor },
    { name: "火星", radius: 0.5, distance: 36 * scaleFactor, color: '#CD4F39', speed: 0.7, size: 0.7 * scaleFactor },
    { name: "木星", radius: 2.0, distance: 52 * scaleFactor, color: '#CD853F', speed: 0.5, size: 2.0 * scaleFactor },
    { name: "土星", radius: 1.8, distance: 68 * scaleFactor, color: '#DAA520', speed: 0.45, size: 1.8 * scaleFactor },
    { name: "天王星", radius: 1.3, distance: 84 * scaleFactor, color: '#4682B4', speed: 0.4, size: 1.3 * scaleFactor },
    { name: "海王星", radius: 1.2, distance: 98 * scaleFactor, color: '#0000CD', speed: 0.35, size: 1.2 * scaleFactor },
  ];

  // 创建背景星星
  useEffect(() => {
    if (!backgroundStarsRef.current || !visible) return;
    
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);
    
    // 生成随机星星
    for (let i = 0; i < starCount; i++) {
      const radius = 150 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) * 0.5; // 扁平分布
      positions[i * 3 + 2] = radius * Math.cos(theta);
      
      sizes[i] = Math.random() * 2 + 0.5;
      
      // 随机星星颜色
      const colorChoice = Math.random();
      if (colorChoice > 0.95) {
        // 红色星星
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.5;
      } else if (colorChoice > 0.9) {
        // 蓝色星星
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1;
      } else {
        // 白色/黄色星星
        const brightness = 0.7 + Math.random() * 0.3;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness * (0.7 + Math.random() * 0.3);
      }
    }
    
    backgroundStarsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    backgroundStarsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    backgroundStarsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [visible]);

  // 行星环绕动画
  useFrame(({ clock }) => {
    if (!visible) return;
    
    // 太阳自转
    if (sunRef.current && !userControl) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    
    // 行星公转
    if (!userControl) {
      planetsRef.current.forEach((planet, i) => {
        if (planet && i > 0) { // 跳过太阳
          const time = clock.getElapsedTime() * planets[i].speed * 0.1;
          const distance = planets[i].distance;
          planet.position.x = Math.cos(time) * distance;
          planet.position.z = Math.sin(time) * distance;
          
          // 行星自转
          planet.rotation.y += planets[i].speed * 0.01;
        }
      });
    }
  });

  useEffect(() => {
    // 初始化行星引用数组
    planetsRef.current = new Array(planets.length).fill(null);
    orbitsRef.current = new Array(planets.length).fill(null);
  }, []);

  if (!visible) return null;

  return (
    <group position={[0, 0, 0]} rotation={[Math.PI / 8, 0, 0]}>
      {/* 背景星星 */}
      <points ref={backgroundStarsRef}>
        <bufferGeometry />
        <pointsMaterial
          vertexColors
          size={1.5}
          sizeAttenuation={true}
          transparent
          opacity={opacity * 0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 太阳 */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[planets[0].size, 32, 32]} />
        <meshStandardMaterial
          color={planets[0].color}
          emissive={planets[0].color}
          emissiveIntensity={2}
        />
        <pointLight intensity={1.5} distance={150} decay={2} />
      </mesh>
      
      {/* 行星和轨道 */}
      {planets.slice(1).map((planet, i) => (
        <group key={i}>
          {/* 轨道 */}
          <mesh 
            ref={el => orbitsRef.current[i+1] = el}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[planet.distance, planet.distance + 0.1, 128]} />
            <meshBasicMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.08 * opacity} 
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* 行星 */}
          <mesh
            ref={el => planetsRef.current[i+1] = el}
            position={[planet.distance, 0, 0]}
          >
            <sphereGeometry args={[planet.size, 16, 16]} />
            <meshStandardMaterial color={planet.color} />
          </mesh>
        </group>
      ))}
      
      {/* 小行星带 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[44 * scaleFactor, 46 * scaleFactor, 128]} />
        <meshBasicMaterial 
          color="#AAAAAA" 
          transparent 
          opacity={0.15 * opacity} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// 银河系组件
function Galaxy({ visible, opacity = 1, userControl }) {
  const galaxyRef = useRef();
  const particlesRef = useRef();
  const dustCloudRef = useRef();
  
  // 参数设置
  const params = {
    count: 8000,
    size: 0.05,
    radius: 20,
    branches: 5,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
  };
  
  // 创建银河系粒子
  useEffect(() => {
    if (!particlesRef.current || !visible) return;
    
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const sizes = new Float32Array(params.count);
    
    const colorInside = new THREE.Color(params.insideColor);
    const colorOutside = new THREE.Color(params.outsideColor);
    
    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3;
      
      // 位置
      const radius = Math.random() * params.radius;
      const spinAngle = radius * params.spin;
      const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
      const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
      const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      // 不同大小的星星
      sizes[i] = Math.random() * 0.1 + 0.03;
      
      // 颜色
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / params.radius);
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // 创建尘埃云
    if (dustCloudRef.current) {
      const dustCount = 2000;
      const dustPositions = new Float32Array(dustCount * 3);
      const dustColors = new Float32Array(dustCount * 3);
      const dustSizes = new Float32Array(dustCount);
      
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        
        // 位置 - 尘埃在旋臂周围形成云状
        const radius = (Math.random() * 0.4 + 0.6) * params.radius * 1.2;
        const spinAngle = radius * params.spin * 0.8;
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;
        
        const randomFactor = 0.4;
        const randomX = Math.random() * randomFactor * radius;
        const randomY = Math.random() * randomFactor * radius * 0.2;
        const randomZ = Math.random() * randomFactor * radius;
        
        dustPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        dustPositions[i3 + 1] = randomY;
        dustPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        
        // 尘埃大小 - 比星星大
        dustSizes[i] = Math.random() * 1.5 + 0.5;
        
        // 尘埃颜色 - 淡蓝色到紫色
        const dustColor = new THREE.Color(0x3366ff);
        dustColor.lerp(new THREE.Color(0x9944cc), Math.random());
        
        dustColors[i3] = dustColor.r;
        dustColors[i3 + 1] = dustColor.g;
        dustColors[i3 + 2] = dustColor.b;
      }
      
      dustCloudRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      dustCloudRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
      dustCloudRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    }
  }, [visible]);
  
  // 银河系自转
  useFrame(({ clock }) => {
    if (galaxyRef.current && visible && !userControl) {
      galaxyRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  if (!visible) return null;

  return (
    <group ref={galaxyRef} scale={[5, 5, 5]}>
      {/* 银河系星星 */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 尘埃云 */}
      <points ref={dustCloudRef}>
        <bufferGeometry />
        <pointsMaterial
          size={2}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors
          transparent
          opacity={opacity * 0.3}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 银河系中心发光球体 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial 
          color={params.insideColor} 
          transparent 
          opacity={opacity * 0.7}
        />
      </mesh>
      
      {/* 中心光源 */}
      <pointLight
        color={params.insideColor}
        intensity={5}
        distance={30}
        decay={2}
      />
    </group>
  );
}

// 宇宙组件
function Universe({ visible, opacity = 1, userControl }) {
  const galaxiesRef = useRef([]);
  const universeRef = useRef();
  const nebulaRef = useRef([]);
  const backgroundRef = useRef();
  const nebulaClustersRef = useRef([]);
  
  // 检测移动端
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // 移动端减少星系数量
  const galaxyCount = isMobile ? 12 : 20;
  
  // 定义多个星系的位置和属性
  const generateGalaxies = () => {
    const galaxies = [
      // 主星系在中心
      { position: [0, 0, 0], scale: 1, rotation: [0, 0, 0], color: '#1b3984' }
    ];
    
    // 随机生成其他星系
    for (let i = 0; i < galaxyCount - 1; i++) {
      const distance = 300 + Math.random() * 800;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * 500;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // 随机颜色
      const colors = [
        '#ff6030', '#30ff60', '#6030ff', '#ff3060', '#60ff30', '#3060ff',
        '#cc3399', '#3399cc', '#99cc33', '#cc9933', '#9933cc', '#33cc99'
      ];
      
      galaxies.push({
        position: [x, elevation, z],
        scale: 0.2 + Math.random() * 0.8,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    return galaxies;
  };
  
  const galaxies = useRef(generateGalaxies());
  
  // 创建星云
  const nebulaeCount = isMobile ? 6 : 10;
  
  // 生成星云簇
  const generateNebulaClusters = () => {
    const clusters = [];
    
    for (let i = 0; i < nebulaeCount; i++) {
      const distance = 200 + Math.random() * 700;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * 400;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // 星云颜色
      const colors = [
        '#5050ff', '#ff5050', '#50ff50', '#ff50ff', '#50ffff', '#ffff50',
        '#aa33aa', '#33aaaa', '#aaaa33', '#aa3333', '#33aa33', '#3333aa'
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // 创建不同类型的星云簇
      clusters.push({
        position: [x, elevation, z],
        color: color,
        particleCount: 300 + Math.floor(Math.random() * 500),
        size: 120 + Math.random() * 180,
        shape: Math.random() > 0.5 ? 'elliptical' : 'irregular',
        density: 0.7 + Math.random() * 0.5
      });
    }
    
    return clusters;
  };
  
  const nebulaClusters = useRef(generateNebulaClusters());
  
  // 创建背景星点
  useEffect(() => {
    if (!backgroundRef.current || !visible) return;
    
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // 球形分布的背景星星
      const radius = 1000 + Math.random() * 1000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // 不同大小的星星
      sizes[i] = Math.random() * 3 + 1;
      
      // 随机星星颜色
      const colorChoice = Math.random();
      if (colorChoice > 0.95) {
        // 红色星星
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.3;
      } else if (colorChoice > 0.9) {
        // 蓝色星星
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1;
      } else {
        // 白色/黄色星星
        const brightness = 0.7 + Math.random() * 0.3;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness * (0.8 + Math.random() * 0.2);
      }
    }
    
    backgroundRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    backgroundRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    backgroundRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 初始化星云簇引用数组
    nebulaClustersRef.current = new Array(nebulaClusters.current.length).fill(null);
    
    // 创建星云簇
    nebulaClusters.current.forEach((cluster, index) => {
      if (nebulaClustersRef.current[index]) {
        const nebulaGeometry = new THREE.BufferGeometry();
        const particleCount = cluster.particleCount;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const clusterColor = new THREE.Color(cluster.color);
        const size = cluster.size;
        
        for (let i = 0; i < particleCount; i++) {
          let x, y, z;
          
          if (cluster.shape === 'elliptical') {
            // 椭圆形星云
            const radius = Math.random() * size * (Math.pow(Math.random(), cluster.density));
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() * 0.8 + 0.1) * Math.PI; // 限制垂直角度
            
            x = radius * Math.sin(phi) * Math.cos(theta);
            y = radius * Math.sin(phi) * Math.sin(theta) * 0.5; // 扁平化
            z = radius * Math.cos(phi) * 0.2; // 更扁平
          } else {
            // 不规则星云
            const radius = Math.random() * size * (Math.pow(Math.random(), cluster.density));
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            // 使用柏林噪声创建不规则形状
            const noiseValue = (Math.sin(x * 0.01) + Math.sin(y * 0.01) + Math.sin(z * 0.01)) * 0.33;
            const distortionFactor = 0.4 + Math.random() * 0.6;
            
            x = radius * Math.sin(phi) * Math.cos(theta) * (1 + noiseValue * distortionFactor);
            y = radius * Math.sin(phi) * Math.sin(theta) * (1 + noiseValue * distortionFactor) * 0.5;
            z = radius * Math.cos(phi) * (1 + noiseValue * distortionFactor) * 0.3;
          }
          
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
          
          // 颜色变化 - 边缘更淡
          const distanceFromCenter = Math.sqrt(x*x + y*y + z*z) / size;
          const colorFade = 1 - Math.pow(distanceFromCenter, 2);
          
          const starColor = clusterColor.clone();
          
          // 随机化星星颜色
          if (Math.random() > 0.7) {
            // 一些亮点
            colors[i * 3] = Math.min(starColor.r + 0.3, 1) * colorFade;
            colors[i * 3 + 1] = Math.min(starColor.g + 0.3, 1) * colorFade;
            colors[i * 3 + 2] = Math.min(starColor.b + 0.3, 1) * colorFade;
            
            // 亮点更大
            sizes[i] = Math.random() * 4 + 2;
          } else {
            colors[i * 3] = starColor.r * colorFade;
            colors[i * 3 + 1] = starColor.g * colorFade;
            colors[i * 3 + 2] = starColor.b * colorFade;
            
            // 常规星点大小
            sizes[i] = Math.random() * 2 + 0.5;
          }
        }
        
        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        nebulaClustersRef.current[index].geometry = nebulaGeometry;
      }
    });
  }, [visible]);
  
  // 宇宙缓慢旋转
  useFrame(({ clock }) => {
    if (universeRef.current && visible && !userControl) {
      universeRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
    
    // 星云簇动画
    if (!userControl) {
      nebulaClustersRef.current.forEach((cluster, i) => {
        if (cluster) {
          // 轻微旋转和脉动
          const time = clock.getElapsedTime() * 0.1;
          const pulse = Math.sin(time + i) * 0.05 + 1;
          cluster.rotation.z = time * 0.05;
          cluster.scale.set(pulse, pulse, pulse);
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={universeRef} scale={[1, 1, 1]}>
      {/* 背景星星 */}
      <points ref={backgroundRef}>
        <bufferGeometry />
        <pointsMaterial
          size={2}
          sizeAttenuation={true}
          vertexColors
          transparent
          opacity={opacity * 0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 星系 */}
      {galaxies.current.map((galaxy, i) => (
        <mesh
          key={i}
          position={galaxy.position}
          rotation={galaxy.rotation}
          scale={[galaxy.scale * 100, galaxy.scale * 10, galaxy.scale * 100]}
          ref={el => galaxiesRef.current[i] = el}
        >
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            color={galaxy.color}
            side={THREE.DoubleSide}
            transparent
            opacity={opacity * 0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* 星云点簇 */}
      {nebulaClusters.current.map((cluster, i) => (
        <points
          key={`nebula-cluster-${i}`}
          position={cluster.position}
          ref={el => nebulaClustersRef.current[i] = el}
        >
          <bufferGeometry />
          <pointsMaterial
            size={2}
            sizeAttenuation={true}
            vertexColors
            transparent
            opacity={opacity * 0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
}

// 主宇宙场景组件
export default function UnifiedCosmicScene({ currentScale, userControl }) {
  // 计算各层级元素的可见性和透明度
  const visibility = {
    earth: currentScale === 'earth',
    solar: currentScale === 'solar' || currentScale === 'galaxy' || currentScale === 'universe',
    galaxy: currentScale === 'galaxy' || currentScale === 'universe',
    universe: currentScale === 'universe'
  };
  
  // 各层级元素的透明度，实现平滑过渡
  const opacity = {
    solar: currentScale === 'solar' ? 1 : currentScale === 'galaxy' ? 0.5 : 0.2,
    galaxy: currentScale === 'galaxy' ? 1 : 0.5,
    universe: 1
  };
  
  return (
    <group>
      {/* 地球 */}
      <Earth visible={visibility.earth} userControl={userControl} />
      
      {/* 太阳系 */}
      <SolarSystem visible={visibility.solar} opacity={opacity.solar} userControl={userControl} />
      
      {/* 银河系 */}
      <Galaxy visible={visibility.galaxy} opacity={opacity.galaxy} userControl={userControl} />
      
      {/* 宇宙 */}
      <Universe visible={visibility.universe} opacity={opacity.universe} userControl={userControl} />
    </group>
  );
} 