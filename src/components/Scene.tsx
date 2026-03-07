import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

export const Scene = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame((state, delta) => {
    timer.update();
    const t = timer.getElapsed();
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;
    
    // Normalize scroll progress (0 to 1)
    const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
    
    if (sphereRef.current) {
      // Base rotation + scroll influence
      sphereRef.current.rotation.y = t * 0.2 + scrollY * 0.001;
      sphereRef.current.rotation.x = t * 0.1;
      
      // Dynamic scaling: Starts at 1.875, shrinks slightly as we scroll
      const scale = 1.875 - scrollProgress * 0.5;
      sphereRef.current.scale.set(scale, scale, scale);
    }
    
    if (groupRef.current) {
      // The "Neural Glide" Path (X-Axis)
      // Path logic: 0 -> 3.5 -> -3.5 -> 0
      // We use a custom sine mapping for a more "glided" feel
      const glideX = Math.sin(scrollProgress * Math.PI * 2) * 4;
      
      // Faster interpolation for more responsive feel
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, glideX, 0.15);
      
      // Vertical floating + slight scroll descent
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15 - (scrollProgress * 0.5);
      
      // Depth shift
      groupRef.current.position.z = -scrollProgress * 1.5;
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#ec4899" />
      <spotLight position={[0, 5, 10]} angle={0.2} penumbra={1} intensity={3} color="#ffffff" />
      
      <Stars radius={120} depth={60} count={8000} factor={5} saturation={0} fade speed={1.5} />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
          {/* Main Globe - No Orbit Ring */}
          <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.875}>
            <MeshDistortMaterial
              color="#6366f1"
              attach="material"
              distort={0.4}
              speed={2}
              roughness={0.05}
              metalness={1}
              wireframe
              emissive="#4f46e5"
              emissiveIntensity={1.5}
            />
          </Sphere>
        </Float>
      </group>
    </>
  );
};
