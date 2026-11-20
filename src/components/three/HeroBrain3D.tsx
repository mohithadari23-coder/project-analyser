import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createHemisphereGeometry,
  detectSoftwareWebGL,
  disposeObjectTree,
  prefersReducedMotion,
  scheduleSoftwareFrame,
} from '../../three/webglUtils';

export function HeroBrain3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const reducedMotion = prefersReducedMotion();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackActive(true);
      return;
    }

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 420;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    camera.position.set(0, 0.4, 8.2);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // Three-point monochrome studio lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x18181b, 0.95);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(5, 6, 7);
    scene.add(key);

    const rimBack = new THREE.PointLight(0xe4e4e7, 16, 25, 1.5);
    rimBack.position.set(-5, 3, -3);
    scene.add(rimBack);

    const rimFront = new THREE.PointLight(0xffffff, 14, 25, 1.5);
    rimFront.position.set(5, -2, 3);
    scene.add(rimFront);

    // Composite Procedural Monochrome AI Brain Assembly
    const brainRoot = new THREE.Group();

    const leftGeo = createHemisphereGeometry('left', 1.5, 2);
    const rightGeo = createHemisphereGeometry('right', 1.5, 2);

    const cortexGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x27272a,
      emissive: 0x18181b,
      emissiveIntensity: 0.45,
      metalness: 0.45,
      roughness: 0.16,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.68,
    });

    const cortexLatticeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });

    const leftCortex = new THREE.Mesh(leftGeo, cortexGlassMat);
    const rightCortex = new THREE.Mesh(rightGeo, cortexGlassMat);
    const leftLattice = new THREE.Mesh(leftGeo, cortexLatticeMat);
    const rightLattice = new THREE.Mesh(rightGeo, cortexLatticeMat);
    leftLattice.scale.setScalar(1.018);
    rightLattice.scale.setScalar(1.018);

    // Glowing pure-white synaptic nucleus
    const nucleusGeo = new THREE.IcosahedronGeometry(0.58, 1);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe4e4e7,
      emissiveIntensity: 1.5,
      metalness: 0.85,
      roughness: 0.12,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);

    // Corpus callosum silver energy bridges
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      emissive: 0xa1a1aa,
      emissiveIntensity: 0.9,
      roughness: 0.22,
      metalness: 0.85,
    });
    const bridgeOffsets = [-0.6, 0, 0.6];
    for (const zOff of bridgeOffsets) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.75, 0.1, zOff),
        new THREE.Vector3(0, 0.42, zOff * 0.8),
        new THREE.Vector3(0.75, 0.1, zOff),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.045, 8, false);
      const bridgeMesh = new THREE.Mesh(tubeGeo, bridgeMat);
      brainRoot.add(bridgeMesh);
    }

    // 3 precision platinum/white telemetry rings
    const ringMatWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd4d4d8,
      emissiveIntensity: 0.7,
      metalness: 0.95,
      roughness: 0.14,
    });
    const ringMatSilver = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      emissive: 0x52525b,
      emissiveIntensity: 0.6,
      metalness: 0.92,
      roughness: 0.2,
    });

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.024, 14, 96),
      ringMatWhite
    );
    ring1.rotation.x = Math.PI / 2.4;
    ring1.rotation.y = 0.35;

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.72, 0.018, 14, 96),
      ringMatSilver
    );
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.z = 0.5;

    const ring3 = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.016, 12, 84),
      ringMatWhite
    );
    ring3.rotation.y = Math.PI / 2.2;

    // Orbiting synaptic nodes (InstancedMesh)
    const nodeCount = 36;
    const nodeGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.2,
      roughness: 0.15,
      metalness: 0.8,
    });
    const nodeInstances = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    nodeInstances.frustumCulled = false;

    const nodeOrbits: Array<{
      radius: number;
      speed: number;
      phase: number;
      tilt: number;
    }> = [];
    const _dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.0 + (i % 5) * 0.24;
      const speed = 0.4 + (i % 4) * 0.18;
      const phase = (i / nodeCount) * Math.PI * 2;
      const tilt = ((i % 7) - 3) * 0.32;
      nodeOrbits.push({ radius, speed, phase, tilt });
      _dummy.position.set(
        Math.cos(phase) * radius,
        Math.sin(phase) * Math.sin(tilt) * radius,
        Math.sin(phase) * radius
      );
      _dummy.updateMatrix();
      nodeInstances.setMatrixAt(i, _dummy.matrix);
    }
    nodeInstances.instanceMatrix.needsUpdate = true;
    nodeInstances.computeBoundingSphere();

    brainRoot.add(
      leftCortex,
      rightCortex,
      leftLattice,
      rightLattice,
      nucleus,
      ring1,
      ring2,
      ring3,
      nodeInstances
    );
    scene.add(brainRoot);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotY = 0.4;
    let targetRotX = 0.12;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        targetRotY += dx * 0.01;
        targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.008, -0.65, 0.65);
      } else {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        targetRotX = THREE.MathUtils.clamp(ny * 0.22, -0.5, 0.5);
        targetRotY += nx * 0.004;
      }
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallbackActive(true);
    };
    domEl.addEventListener('webglcontextlost', onContextLost);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (!reducedMotion) {
        if (!isDragging) {
          targetRotY += delta * 0.28;
        }
        brainRoot.rotation.y = THREE.MathUtils.damp(
          brainRoot.rotation.y,
          targetRotY,
          5.5,
          delta
        );
        brainRoot.rotation.x = THREE.MathUtils.damp(
          brainRoot.rotation.x,
          targetRotX,
          5.5,
          delta
        );
        brainRoot.position.y = Math.sin(elapsed * 1.1) * 0.14;

        ring1.rotation.z = elapsed * 0.38;
        ring2.rotation.y = -elapsed * 0.32;
        ring3.rotation.x = elapsed * 0.44;
        nucleusMat.emissiveIntensity = 1.2 + Math.sin(elapsed * 2.8) * 0.4;

        for (let i = 0; i < nodeCount; i++) {
          const o = nodeOrbits[i];
          const angle = elapsed * o.speed + o.phase;
          _dummy.position.set(
            Math.cos(angle) * o.radius,
            Math.sin(angle) * Math.sin(o.tilt) * o.radius,
            Math.sin(angle) * o.radius
          );
          _dummy.updateMatrix();
          nodeInstances.setMatrixAt(i, _dummy.matrix);
        }
        nodeInstances.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (reducedMotion) return;

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
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      disposeObjectTree(scene);
      envTex.dispose();
      renderer.dispose();
      if (domEl.parentElement === container) {
        container.removeChild(domEl);
      }
    };
  }, []);

  if (fallbackActive) {
    return (
      <div className="w-full h-full min-h-[340px] flex items-center justify-center rounded-2xl border border-white/15 bg-zinc-950/80">
        <div className="text-center px-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-300 to-white opacity-85" />
          <p className="text-sm font-mono text-zinc-300">Neural Research Core</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-label="Interactive 3D Holographic AI Brain"
      className="w-full h-[340px] sm:h-[400px] lg:h-[440px] cursor-grab active:cursor-grabbing select-none"
    />
  );
}
