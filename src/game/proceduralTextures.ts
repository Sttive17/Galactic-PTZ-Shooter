import * as THREE from 'three';

export interface FloorTextureSet {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

export interface DualTextureSet {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

let cachedFloor: FloorTextureSet | null = null;
let cachedArmor: DualTextureSet | null = null;
let cachedCrate: DualTextureSet | null = null;

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  isColorMap: boolean,
  repeatX: number,
  repeatY: number,
  anisotropy = 4
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  if (isColorMap) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

export function getFloorTextures(): FloorTextureSet {
  if (cachedFloor) return cachedFloor;

  const size = 512;
  const [colorCanvas, cCtx] = makeCanvas(size, size);
  const [bumpCanvas, bCtx] = makeCanvas(size, size);
  const [roughCanvas, rCtx] = makeCanvas(size, size);

  // Neutral bright metallic base so material color tint reads clearly
  cCtx.fillStyle = '#c8d4e3';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#909090';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#707070';
  rCtx.fillRect(0, 0, size, size);

  // Subtle brushed metal horizontal streaks
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 20 + Math.random() * 70;
    const shade = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    cCtx.fillStyle = shade;
    cCtx.fillRect(x, y, w, 1.5);
    rCtx.fillStyle = Math.random() > 0.5 ? 'rgba(200,200,200,0.08)' : 'rgba(60,60,60,0.08)';
    rCtx.fillRect(x, y, w, 1.5);
  }

  // 2x2 Industrial steel floor tiles
  const tile = size / 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const tx = col * tile;
      const ty = row * tile;

      // Subtle inner tile plate contrast
      cCtx.fillStyle = (row + col) % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
      cCtx.fillRect(tx + 8, ty + 8, tile - 16, tile - 16);

      // Recessed outer seam
      cCtx.strokeStyle = '#64748b';
      cCtx.lineWidth = 4;
      cCtx.strokeRect(tx + 2, ty + 2, tile - 4, tile - 4);

      bCtx.strokeStyle = '#202020';
      bCtx.lineWidth = 5;
      bCtx.strokeRect(tx + 2, ty + 2, tile - 4, tile - 4);

      rCtx.strokeStyle = '#d8d8d8';
      rCtx.lineWidth = 6;
      rCtx.strokeRect(tx + 2, ty + 2, tile - 4, tile - 4);

      // Inner bevel groove
      cCtx.strokeStyle = 'rgba(255,255,255,0.28)';
      cCtx.lineWidth = 1.5;
      cCtx.strokeRect(tx + 12, ty + 12, tile - 24, tile - 24);

      bCtx.strokeStyle = '#c4c4c4';
      bCtx.lineWidth = 2;
      bCtx.strokeRect(tx + 12, ty + 12, tile - 24, tile - 24);

      // Subtle glowing micro-conduit seam & specular groove contrast
      cCtx.strokeStyle = 'rgba(125,211,252,0.22)';
      cCtx.lineWidth = 1.5;
      cCtx.beginPath();
      cCtx.moveTo(tx + 28, ty + tile / 2);
      cCtx.lineTo(tx + tile - 28, ty + tile / 2);
      cCtx.stroke();

      rCtx.strokeStyle = '#282828';
      rCtx.lineWidth = 4;
      rCtx.beginPath();
      rCtx.moveTo(tx + 28, ty + tile / 2);
      rCtx.lineTo(tx + tile - 28, ty + tile / 2);
      rCtx.stroke();

      // Diagonal anti-slip tread accents inside tile
      cCtx.strokeStyle = 'rgba(255,255,255,0.08)';
      bCtx.strokeStyle = '#b0b0b0';
      cCtx.lineWidth = 2;
      bCtx.lineWidth = 2;
      for (let d = 44; d <= tile - 64; d += 22) {
        cCtx.beginPath();
        cCtx.moveTo(tx + d, ty + 32);
        cCtx.lineTo(tx + d + 12, ty + 46);
        cCtx.moveTo(tx + d, ty + tile - 46);
        cCtx.lineTo(tx + d + 12, ty + tile - 32);
        cCtx.stroke();

        bCtx.beginPath();
        bCtx.moveTo(tx + d, ty + 32);
        bCtx.lineTo(tx + d + 12, ty + 46);
        bCtx.moveTo(tx + d, ty + tile - 46);
        bCtx.lineTo(tx + d + 12, ty + tile - 32);
        bCtx.stroke();
      }

      // Corner hex bolts
      const boltOffsets = [22, tile - 22];
      for (const bx of boltOffsets) {
        for (const by of boltOffsets) {
          cCtx.fillStyle = '#94a3b8';
          cCtx.beginPath();
          cCtx.arc(tx + bx, ty + by, 4, 0, Math.PI * 2);
          cCtx.fill();

          cCtx.fillStyle = '#475569';
          cCtx.beginPath();
          cCtx.arc(tx + bx, ty + by, 2, 0, Math.PI * 2);
          cCtx.fill();

          bCtx.fillStyle = '#efefef';
          bCtx.beginPath();
          bCtx.arc(tx + bx, ty + by, 4, 0, Math.PI * 2);
          bCtx.fill();
        }
      }
    }
  }

  cachedFloor = {
    map: finalizeTexture(colorCanvas, true, 28, 28, 8),
    bumpMap: finalizeTexture(bumpCanvas, false, 28, 28, 8),
    roughnessMap: finalizeTexture(roughCanvas, false, 28, 28, 8),
  };
  return cachedFloor;
}

export function getArmorTextures(): DualTextureSet {
  if (cachedArmor) return cachedArmor;

  const size = 256;
  const [colorCanvas, cCtx] = makeCanvas(size, size);
  const [bumpCanvas, bCtx] = makeCanvas(size, size);

  cCtx.fillStyle = '#cdd8e6';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#888888';
  bCtx.fillRect(0, 0, size, size);

  // Micro metallic surface grain
  for (let i = 0; i < 240; i++) {
    cCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)';
    cCtx.fillRect(Math.random() * size, Math.random() * size, 16 + Math.random() * 32, 2);
  }

  // Armor plate seams
  cCtx.strokeStyle = '#64748b';
  cCtx.lineWidth = 4;
  cCtx.strokeRect(2, 2, size - 4, size - 4);
  cCtx.beginPath();
  cCtx.moveTo(size / 2, 0);
  cCtx.lineTo(size / 2, size - 36);
  cCtx.moveTo(0, size * 0.45);
  cCtx.lineTo(size, size * 0.45);
  cCtx.stroke();

  bCtx.strokeStyle = '#252525';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(2, 2, size - 4, size - 4);
  bCtx.beginPath();
  bCtx.moveTo(size / 2, 0);
  bCtx.lineTo(size / 2, size - 36);
  bCtx.moveTo(0, size * 0.45);
  bCtx.lineTo(size, size * 0.45);
  bCtx.stroke();

  // Crisp bevel highlight along armor seams + sleek sci-fi tech vent slits
  cCtx.strokeStyle = 'rgba(255,255,255,0.28)';
  cCtx.lineWidth = 1.5;
  cCtx.strokeRect(5, 5, size - 10, size - 10);

  for (let v = 0; v < 4; v++) {
    const vy = 28 + v * 12;
    cCtx.fillStyle = '#334155';
    cCtx.fillRect(26, vy, 58, 5);
    cCtx.fillRect(size - 84, vy, 58, 5);
    bCtx.fillStyle = '#353535';
    bCtx.fillRect(26, vy, 58, 5);
    bCtx.fillRect(size - 84, vy, 58, 5);
  }

  // Diagonal hazard stripe band along bottom edge
  const bandY = size - 34;
  cCtx.save();
  cCtx.beginPath();
  cCtx.rect(0, bandY, size, 34);
  cCtx.clip();
  cCtx.fillStyle = '#1e293b';
  cCtx.fillRect(0, bandY, size, 34);
  cCtx.fillStyle = '#eab308';
  for (let x = -40; x < size + 40; x += 28) {
    cCtx.beginPath();
    cCtx.moveTo(x, bandY + 34);
    cCtx.lineTo(x + 14, bandY + 34);
    cCtx.lineTo(x + 30, bandY);
    cCtx.lineTo(x + 16, bandY);
    cCtx.closePath();
    cCtx.fill();
  }
  cCtx.restore();

  // Rivets along top and middle seams
  const rivetX = [16, 64, 112, 144, 192, 240];
  const rivetY = [16, size * 0.45 - 14, size * 0.45 + 14, bandY - 12];
  for (const rx of rivetX) {
    for (const ry of rivetY) {
      cCtx.fillStyle = '#94a3b8';
      cCtx.beginPath();
      cCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      cCtx.fill();

      bCtx.fillStyle = '#ededed';
      bCtx.beginPath();
      bCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  cachedArmor = {
    map: finalizeTexture(colorCanvas, true, 2, 2, 4),
    bumpMap: finalizeTexture(bumpCanvas, false, 2, 2, 4),
  };
  return cachedArmor;
}

export function getCrateTextures(): DualTextureSet {
  if (cachedCrate) return cachedCrate;

  const size = 256;
  const [colorCanvas, cCtx] = makeCanvas(size, size);
  const [bumpCanvas, bCtx] = makeCanvas(size, size);

  // Recessed interior panel
  cCtx.fillStyle = '#a8b7c9';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#606060';
  bCtx.fillRect(0, 0, size, size);

  // Diagonal X-frame structural bracing
  cCtx.strokeStyle = '#cbd5e1';
  cCtx.lineWidth = 22;
  cCtx.beginPath();
  cCtx.moveTo(16, 16);
  cCtx.lineTo(size - 16, size - 16);
  cCtx.moveTo(size - 16, 16);
  cCtx.lineTo(16, size - 16);
  cCtx.stroke();

  bCtx.strokeStyle = '#c8c8c8';
  bCtx.lineWidth = 22;
  bCtx.beginPath();
  bCtx.moveTo(16, 16);
  bCtx.lineTo(size - 16, size - 16);
  bCtx.moveTo(size - 16, 16);
  bCtx.lineTo(16, size - 16);
  bCtx.stroke();

  // Outer reinforced steel frame
  cCtx.strokeStyle = '#e2e8f0';
  cCtx.lineWidth = 34;
  cCtx.strokeRect(0, 0, size, size);

  bCtx.strokeStyle = '#e5e5e5';
  bCtx.lineWidth = 34;
  bCtx.strokeRect(0, 0, size, size);

  // Corner brackets
  const corner = 42;
  cCtx.fillStyle = '#64748b';
  bCtx.fillStyle = '#ffffff';
  const corners = [
    [0, 0],
    [size - corner, 0],
    [0, size - corner],
    [size - corner, size - corner],
  ];
  for (const [cx, cy] of corners) {
    cCtx.fillRect(cx, cy, corner, corner);
    bCtx.fillRect(cx, cy, corner, corner);
  }

  // Center stencil badge
  cCtx.fillStyle = '#475569';
  cCtx.fillRect(size / 2 - 36, size / 2 - 14, 72, 28);
  cCtx.fillStyle = '#f59e0b';
  cCtx.fillRect(size / 2 - 28, size / 2 - 6, 56, 4);
  cCtx.fillStyle = '#cbd5e1';
  cCtx.fillRect(size / 2 - 20, size / 2 + 2, 40, 4);

  cachedCrate = {
    map: finalizeTexture(colorCanvas, true, 1, 1, 4),
    bumpMap: finalizeTexture(bumpCanvas, false, 1, 1, 4),
  };
  return cachedCrate;
}
