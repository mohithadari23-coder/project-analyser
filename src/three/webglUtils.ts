import * as THREE from 'three';

let cachedSoftwareGl: boolean | null = null;

export function detectSoftwareWebGL(): boolean {
  if (cachedSoftwareGl !== null) {
    return cachedSoftwareGl;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedSoftwareGl;
  } catch {
    cachedSoftwareGl = true;
    return true;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scheduleSoftwareFrame(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  setTimerId: (id: number) => void
): void {
  const gl = renderer.getContext() as WebGL2RenderingContext | null;
  if (!gl || gl.isContextLost() || typeof gl.fenceSync !== 'function') {
    const id = window.setTimeout(cb, 80);
    setTimerId(id);
    return;
  }
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  const poll = () => {
    if (gl.isContextLost()) {
      if (sync) gl.deleteSync(sync);
      return;
    }
    const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      setTimerId(window.setTimeout(poll, 5));
    } else {
      if (sync) gl.deleteSync(sync);
      setTimerId(window.setTimeout(cb, 80));
    }
  };
  setTimerId(window.setTimeout(poll, 5));
}

export function createFormulaTexture(
  formula: string,
  accentColor = '#FFFFFF'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle scientific bracket & framing
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 28);
    ctx.lineTo(12, 28);
    ctx.lineTo(12, 100);
    ctx.lineTo(22, 100);
    ctx.moveTo(490, 28);
    ctx.lineTo(500, 28);
    ctx.lineTo(500, 100);
    ctx.lineTo(490, 100);
    ctx.stroke();

    ctx.font = '500 34px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillText(formula, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates an organically displaced cerebral hemisphere geometry.
 */
export function createHemisphereGeometry(
  side: 'left' | 'right',
  radius = 1.65,
  detail = 3
): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const dir = side === 'left' ? -1 : 1;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Flatten the medial longitudinal fissure side
    if ((side === 'left' && x > 0) || (side === 'right' && x < 0)) {
      x *= 0.16;
    }

    // Elongate anterior-posterior (Z) and slightly compress height (Y)
    z *= 1.24;
    y *= 0.92;
    x *= 0.78;

    // Subtle cortical gyri/sulci wave modulation
    const fold =
      Math.sin(x * 4.2 + z * 3.1) * 0.055 +
      Math.cos(y * 5.1 - z * 2.7) * 0.045;
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    x += (x / len) * fold + dir * 0.14;
    y += (y / len) * fold;
    z += (z / len) * fold;

    pos.setXYZ(i, x, y, z);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const matAny = m as unknown as Record<string, unknown>;
        if (matAny.map && typeof (matAny.map as THREE.Texture).dispose === 'function') {
          (matAny.map as THREE.Texture).dispose();
        }
        m.dispose();
      }
    }
  });
}
