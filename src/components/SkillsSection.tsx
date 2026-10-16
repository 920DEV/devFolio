import { useEffect, useRef } from "react";
import * as THREE from "three";
import facePortraitUrl from "../assets/face-portrait.webp";
import faceHeightUrl from "../assets/face-height.webp";

type FaceSceneProps = {
  /** Accent color (hex string) used for the rim light + glow aura, e.g. from a hovered achievement. */
  accentColor?: string;
};

const DEFAULT_ACCENT = "#37d7b2";
const SEGMENTS = 160; // vertex grid resolution used for the relief displacement

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sampleHeightGrid(img: HTMLImageElement, gridSize: number): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, gridSize, gridSize);
  const { data } = ctx.getImageData(0, 0, gridSize, gridSize);
  const out = new Float32Array(gridSize * gridSize);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = data[i * 4] / 255;
  }
  return out;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function FaceScene({ accentColor = DEFAULT_ACCENT }: FaceSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const accentRef = useRef(new THREE.Color(accentColor));

  useEffect(() => {
    accentRef.current.set(accentColor);
  }, [accentColor]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let disposed = false;
    let animationFrame = 0;
    const cleanupFns: Array<() => void> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.05, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    // Ambient fill + a soft key light so the relief always reads
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const keyLight = new THREE.PointLight(0xffffff, 18, 30);
    keyLight.position.set(1.4, 2.2, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(accentRef.current.getHex(), 22, 26);
    rimLight.position.set(-2.2, -0.6, 2.6);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 4, 20);
    fillLight.position.set(0, -1.5, 3.5);
    scene.add(fillLight);

    // Soft aura glow behind the portrait
    const glowTexture = makeGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: accentRef.current,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(4.6, 4.6, 1);
    glow.position.set(0, 0, -0.6);
    faceGroup.add(glow);

    // Ambient background particles, for continuity with the rest of the hero
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 360;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 4.6 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi) * 0.6 - 2;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.014,
        transparent: true,
        opacity: 0.4,
      }),
    );
    scene.add(stars);

    let faceMesh: THREE.Mesh | null = null;

    const pointer = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize against the viewport so the face can "notice" the cursor
      // even when it wanders outside the canvas bounds.
      const spanX = Math.max(window.innerWidth / 2, 1);
      const spanY = Math.max(window.innerHeight / 2, 1);
      pointer.x = Math.max(-1, Math.min(1, (event.clientX - cx) / spanX));
      pointer.y = Math.max(-1, Math.min(1, (event.clientY - cy) / spanY));
      targetRotation.y = pointer.x * 0.55;
      targetRotation.x = -pointer.y * 0.28;
    };

    window.addEventListener("pointermove", handlePointerMove);
    cleanupFns.push(() => window.removeEventListener("pointermove", handlePointerMove));

    Promise.all([loadImage(facePortraitUrl), loadImage(faceHeightUrl)])
      .then(([portraitImg, heightImg]) => {
        if (disposed) {
          return;
        }

        const gridSize = SEGMENTS + 1;
        const heightData = sampleHeightGrid(heightImg, gridSize);

        const geometry = new THREE.PlaneGeometry(3.5, 3.5, SEGMENTS, SEGMENTS);
        const position = geometry.attributes.position as THREE.BufferAttribute;
        const displacementScale = 0.55;
        const displacementBias = -0.16;

        for (let row = 0; row < gridSize; row += 1) {
          for (let col = 0; col < gridSize; col += 1) {
            // PlaneGeometry vertices run left-to-right, bottom-to-top.
            const vertexIndex = row * gridSize + col;
            const sampleRow = gridSize - 1 - row; // flip to match image top-down order
            const h = heightData[sampleRow * gridSize + col];
            const z = h * displacementScale + displacementBias;
            position.setZ(vertexIndex, z);
          }
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();

        const portraitTexture = new THREE.Texture(portraitImg);
        portraitTexture.colorSpace = THREE.SRGBColorSpace;
        portraitTexture.needsUpdate = true;

        const material = new THREE.MeshStandardMaterial({
          map: portraitTexture,
          transparent: true,
          alphaTest: 0.02,
          roughness: 0.7,
          metalness: 0.04,
          side: THREE.DoubleSide,
        });

        faceMesh = new THREE.Mesh(geometry, material);
        faceGroup.add(faceMesh);
      })
      .catch(() => {
        // If the textures fail to load we simply keep the ambient scene
        // (glow + particles) without the relief plane.
      });

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      const t = performance.now() * 0.001;

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;

      faceGroup.rotation.x = currentRotation.x + Math.sin(t * 0.6) * 0.015;
      faceGroup.rotation.y = currentRotation.y + Math.sin(t * 0.4) * 0.02;
      faceGroup.position.y = Math.sin(t * 0.8) * 0.045;

      glow.material.color.lerp(accentRef.current, 0.04);
      rimLight.color.lerp(accentRef.current, 0.04);
      const glowPulse = 1 + Math.sin(t * 1.4) * 0.05;
      glow.scale.set(4.6 * glowPulse, 4.6 * glowPulse, 1);

      stars.rotation.y = t * 0.02;

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    cleanupFns.push(() => observer.disconnect());

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      cleanupFns.forEach((fn) => fn());
      renderer.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const mat = object.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
      if (faceMesh) {
        const mat = faceMesh.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();
      }
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="face-scene-shell" ref={hostRef} aria-label="Interactive 3D portrait that turns toward your cursor" />
  );
}
