import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    /* Scene */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    /* Particles */
    const count = 600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#B11226'),
      new THREE.Color('#F05A28'),
      new THREE.Color('#F5B301'),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    /* Animation loop */
    let animId;
    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove(e) {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function animate() {
      animId = requestAnimationFrame(animate);
      points.rotation.y += 0.0008;
      points.rotation.x += 0.0003;
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
      renderer.render(scene, camera);
    }
    animate();

    /* Resize */
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="three-bg" />;
}
