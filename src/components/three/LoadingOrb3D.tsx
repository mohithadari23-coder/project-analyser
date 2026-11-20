import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareWebGL,
  disposeObjectTree,
  scheduleSoftwareFrame,
} from '../../three/webglUtils';

export function LoadingOrb3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const size = 220;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.set(0, 0, 5.5);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const point1 = new THREE.PointLight(0xffffff, 12, 20);
    point1.position.set(3, 3, 4);
    scene.add(point1);
    const point2 = new THREE.PointLight(0xa1a1aa, 12, 20);
    point2.position.set(-3, -2, 3);
    scene.add(point2);

    const orbGroup = new THREE.Group();

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 2),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xd4d4d8,
        emissiveIntensity: 1.15,
        metalness: 0.75,
        roughness: 0.16,
      })
    );
    const cage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.22, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
    );
    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(1.58, 0.032, 12, 72),
      new THREE.MeshStandardMaterial({
        color: 0xe4e4e7,
        emissive: 0x71717a,
        emissiveIntensity: 0.85,
        metalness: 0.9,
        roughness: 0.18,
      })
    );
    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.025, 12, 72),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x52525b,
        emissiveIntensity: 0.75,
        metalness: 0.9,
        roughness: 0.18,
      })
    );
    ringA.rotation.x = Math.PI / 3;
    ringB.rotation.y = Math.PI / 3;

    orbGroup.add(innerCore, cage, ringA, ringB);
    scene.add(orbGroup);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();

      innerCore.rotation.y = elapsed * 0.9;
      innerCore.rotation.x = elapsed * 0.45;
      cage.rotation.y = -elapsed * 0.65;
      cage.rotation.z = elapsed * 0.3;
      ringA.rotation.z = elapsed * 1.4;
      ringA.rotation.y = elapsed * 0.5;
      ringB.rotation.x = -elapsed * 1.2;
      ringB.rotation.z = elapsed * 0.4;

      const pulse = 1 + Math.sin(elapsed * 3.5) * 0.06;
      innerCore.scale.setScalar(pulse);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        scheduleSoftwareFrame(renderer, tick, (id) => {
          frameId = id;
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      disposeObjectTree(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="w-[220px] h-[220px] mx-auto flex items-center justify-center"
    />
  );
}
