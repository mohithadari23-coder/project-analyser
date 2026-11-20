import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createFormulaTexture,
  createHemisphereGeometry,
  detectSoftwareWebGL,
  disposeObjectTree,
  prefersReducedMotion,
  scheduleSoftwareFrame,
} from '../../three/webglUtils';

const SCIENTIFIC_FORMULAS = [
  'H(X) = -∑ p(x) log₂ p(x)',
  '∇ · E = ρ / ε₀',
  'f(x) = σ(W·x + b)',
  'iℏ ∂ψ/∂t = Ĥψ',
  'λ = h / p',
  'R_μν - ½Rg_μν = κT_μν',
  'P(A|B) = P(B|A)P(A)/P(B)',
  'ΔS ≥ 0',
];

export function ThreeBackground() {
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
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setFallbackActive(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#16082e');
    scene.fog = new THREE.FogExp2('#16082e', 0.022);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    camera.position.set(0, 1.5, 22);

    // Mandatory studio environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3-point purple/white studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3b0764, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
    keyLight.position.set(12, 16, 14);
    scene.add(keyLight);

    const rimLeft = new THREE.PointLight(0xc084fc, 22, 65, 1.6);
    rimLeft.position.set(-14, 7, -10);
    scene.add(rimLeft);

    const rimRight = new THREE.PointLight(0xffffff, 18, 55, 1.6);
    rimRight.position.set(14, -4, -8);
    scene.add(rimRight);

    // 1. Subtle futuristic purple/silver grid floor
    const floorGroup = new THREE.Group();
    floorGroup.position.y = -10.5;
    const gridHelper = new THREE.GridHelper(110, 44, 0xa855f7, 0x3b0764);
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.36;
    floorGroup.add(gridHelper);

    const floorPlaneGeo = new THREE.PlaneGeometry(110, 110);
    const floorPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x16082e,
      roughness: 0.9,
      metalness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const floorPlane = new THREE.Mesh(floorPlaneGeo, floorPlaneMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -0.02;
    floorGroup.add(floorPlane);
    scene.add(floorGroup);

    // 2. Large floating 3D holographic AI brain in deep background
    const bgBrainGroup = new THREE.Group();
    bgBrainGroup.position.set(0, 2.2, -17);
    bgBrainGroup.scale.setScalar(2.4);

    const leftHemiGeo = createHemisphereGeometry('left', 1.45, 2);
    const rightHemiGeo = createHemisphereGeometry('right', 1.45, 2);
    const brainShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x27272a,
      emissive: 0x18181b,
      emissiveIntensity: 0.5,
      metalness: 0.45,
      roughness: 0.22,
      transparent: true,
      opacity: 0.36,
      wireframe: false,
    });
    const brainWireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });

    const leftShell = new THREE.Mesh(leftHemiGeo, brainShellMat);
    const rightShell = new THREE.Mesh(rightHemiGeo, brainShellMat);
    const leftWire = new THREE.Mesh(leftHemiGeo, brainWireMat);
    const rightWire = new THREE.Mesh(rightHemiGeo, brainWireMat);
    leftWire.scale.setScalar(1.015);
    rightWire.scale.setScalar(1.015);

    const coreGeo = new THREE.OctahedronGeometry(0.62, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd4d4d8,
      emissiveIntensity: 1.2,
      roughness: 0.15,
      metalness: 0.85,
    });
    const brainCore = new THREE.Mesh(coreGeo, coreMat);

    const outerRingGeo = new THREE.TorusGeometry(2.65, 0.022, 12, 96);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      emissive: 0x52525b,
      emissiveIntensity: 0.65,
      metalness: 0.92,
      roughness: 0.18,
    });
    const bgRing1 = new THREE.Mesh(outerRingGeo, outerRingMat);
    bgRing1.rotation.x = Math.PI / 3;
    const bgRing2 = new THREE.Mesh(outerRingGeo, outerRingMat);
    bgRing2.rotation.y = Math.PI / 3;
    bgRing2.scale.setScalar(0.84);

    bgBrainGroup.add(
      leftShell,
      rightShell,
      leftWire,
      rightWire,
      brainCore,
      bgRing1,
      bgRing2
    );
    scene.add(bgBrainGroup);

    // 3. Undulating silver/white wireframe light wave mesh
    const waveGeo = new THREE.PlaneGeometry(58, 28, 26, 12);
    waveGeo.rotateX(-Math.PI / 2.35);
    const waveBaseY = new Float32Array(waveGeo.attributes.position.count);
    for (let i = 0; i < waveGeo.attributes.position.count; i++) {
      waveBaseY[i] = waveGeo.attributes.position.getY(i);
    }
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xa1a1aa,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0, -6.5, -14);
    scene.add(waveMesh);

    // 4. Rotating 3D scientific geometric objects
    const geoObjects: Array<{
      mesh: THREE.Object3D;
      speedX: number;
      speedY: number;
      baseY: number;
      phase: number;
    }> = [];

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4d4d8,
      emissive: 0x27272a,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.16,
      clearcoat: 1.0,
    });
    const wireframeAccentMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });

    const knotGroup = new THREE.Group();
    const knotMesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.15, 0.24, 72, 12, 2, 3),
      crystalMat
    );
    const knotCage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.1, 0),
      wireframeAccentMat
    );
    knotGroup.add(knotMesh, knotCage);
    knotGroup.position.set(-13.5, 4.5, -6);
    scene.add(knotGroup);
    geoObjects.push({
      mesh: knotGroup,
      speedX: 0.16,
      speedY: 0.24,
      baseY: 4.5,
      phase: 0.3,
    });

    const prismGroup = new THREE.Group();
    const prismInner = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.25, 0),
      new THREE.MeshStandardMaterial({
        color: 0x3f3f46,
        emissive: 0x18181b,
        emissiveIntensity: 0.45,
        metalness: 0.9,
        roughness: 0.18,
      })
    );
    const prismOuter = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.85, 0),
      wireframeAccentMat
    );
    prismGroup.add(prismInner, prismOuter);
    prismGroup.position.set(13.8, -2.2, -5);
    scene.add(prismGroup);
    geoObjects.push({
      mesh: prismGroup,
      speedX: -0.14,
      speedY: 0.21,
      baseY: -2.2,
      phase: 1.8,
    });

    const satMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf4f4f5,
        emissive: 0x3f3f46,
        emissiveIntensity: 0.4,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    satMesh.position.set(11.5, 6.2, -9);
    scene.add(satMesh);
    geoObjects.push({
      mesh: satMesh,
      speedX: 0.2,
      speedY: -0.18,
      baseY: 6.2,
      phase: 3.1,
    });

    // 5. Floating glass particles & luminous white/silver spheres (InstancedMesh)
    const particleCount = 72;
    const particleGeo = new THREE.SphereGeometry(0.085, 10, 10);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd4d4d8,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.75,
    });
    const instancedParticles = new THREE.InstancedMesh(
      particleGeo,
      particleMat,
      particleCount
    );
    instancedParticles.frustumCulled = false;

    const particleData: Array<{
      x: number;
      y: number;
      z: number;
      scale: number;
      speed: number;
      phase: number;
    }> = [];
    const dummy = new THREE.Object3D();
    const pColor = new THREE.Color();
    const paletteHex = [0xffffff, 0xe4e4e7, 0xa1a1aa, 0x71717a];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 38;
      const y = (Math.random() - 0.5) * 22;
      const z = -2 - Math.random() * 24;
      const scale = 0.5 + Math.random() * 1.4;
      particleData.push({
        x,
        y,
        z,
        scale,
        speed: 0.2 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      });
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
      pColor.setHex(paletteHex[i % paletteHex.length]);
      instancedParticles.setColorAt(i, pColor);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;
    if (instancedParticles.instanceColor) {
      instancedParticles.instanceColor.needsUpdate = true;
    }
    instancedParticles.computeBoundingSphere();
    scene.add(instancedParticles);

    // 6. Animated neural network connections
    const netNodes: THREE.Vector3[] = [];
    for (let i = 0; i < 34; i++) {
      netNodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 16,
          -6 - Math.random() * 14
        )
      );
    }
    const linePositions: number[] = [];
    for (let i = 0; i < netNodes.length; i++) {
      for (let j = i + 1; j < netNodes.length; j++) {
        if (netNodes[i].distanceTo(netNodes[j]) < 7.2) {
          linePositions.push(
            netNodes[i].x,
            netNodes[i].y,
            netNodes[i].z,
            netNodes[j].x,
            netNodes[j].y,
            netNodes[j].z
          );
        }
      }
    }
    const neuralGeo = new THREE.BufferGeometry();
    neuralGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    const neuralMat = new THREE.LineBasicMaterial({
      color: 0xd4d4d8,
      transparent: true,
      opacity: 0.16,
    });
    const neuralLines = new THREE.LineSegments(neuralGeo, neuralMat);
    scene.add(neuralLines);

    // 7. Floating mathematical formulas & scientific sprites
    const formulaSprites: Array<{
      sprite: THREE.Sprite;
      baseY: number;
      phase: number;
    }> = [];
    SCIENTIFIC_FORMULAS.forEach((formula, idx) => {
      const tex = createFormulaTexture(
        formula,
        idx % 2 === 0 ? '#FFFFFF' : '#A1A1AA'
      );
      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const side = idx % 2 === 0 ? -1 : 1;
      const x = side * (8 + (idx % 3) * 4.2);
      const y = -5 + idx * 1.55;
      const z = -8 - (idx % 4) * 3.2;
      sprite.position.set(x, y, z);
      sprite.scale.set(4.8, 1.2, 1);
      scene.add(sprite);
      formulaSprites.push({ sprite, baseY: y, phase: idx * 0.9 });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallbackActive(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const clock = new THREE.Clock();
    const _dummy = new THREE.Object3D();
    let frameId = 0;
    let disposed = false;

    const renderFrame = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (!reducedMotion) {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          pointer.x * 1.85,
          3.2,
          delta
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          1.5 + pointer.y * 1.15,
          3.2,
          delta
        );
        camera.lookAt(0, 0.5, -12);

        bgBrainGroup.rotation.y = elapsed * 0.12;
        bgBrainGroup.position.y = 2.2 + Math.sin(elapsed * 0.55) * 0.45;
        bgRing1.rotation.z = elapsed * 0.25;
        bgRing2.rotation.x = -elapsed * 0.2;
        coreMat.emissiveIntensity = 1.0 + Math.sin(elapsed * 2.2) * 0.3;

        const wPos = waveGeo.attributes.position;
        for (let i = 0; i < wPos.count; i++) {
          const x = wPos.getX(i);
          const z = wPos.getZ(i);
          const wave =
            Math.sin(x * 0.16 + elapsed * 0.8) * 0.65 +
            Math.cos(z * 0.22 + elapsed * 0.65) * 0.55;
          wPos.setY(i, waveBaseY[i] + wave);
        }
        wPos.needsUpdate = true;

        for (let i = 0; i < geoObjects.length; i++) {
          const item = geoObjects[i];
          item.mesh.rotation.x += delta * item.speedX;
          item.mesh.rotation.y += delta * item.speedY;
          item.mesh.position.y =
            item.baseY + Math.sin(elapsed * 0.8 + item.phase) * 0.45;
        }

        for (let i = 0; i < particleCount; i++) {
          const p = particleData[i];
          const py = p.y + Math.sin(elapsed * p.speed + p.phase) * 0.75;
          _dummy.position.set(p.x, py, p.z);
          _dummy.scale.setScalar(p.scale);
          _dummy.updateMatrix();
          instancedParticles.setMatrixAt(i, _dummy.matrix);
        }
        instancedParticles.instanceMatrix.needsUpdate = true;

        neuralLines.rotation.y = Math.sin(elapsed * 0.08) * 0.12;

        for (let i = 0; i < formulaSprites.length; i++) {
          const f = formulaSprites[i];
          f.sprite.position.y =
            f.baseY + Math.sin(elapsed * 0.6 + f.phase) * 0.38;
        }
      }

      renderer.render(scene, camera);

      if (reducedMotion) return;

      if (isSoftwareGl) {
        scheduleSoftwareFrame(renderer, renderFrame, (id) => {
          frameId = id;
        });
      } else {
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      disposeObjectTree(scene);
      envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (fallbackActive) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#3b0764_0%,#120624_68%)]"
      />
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
