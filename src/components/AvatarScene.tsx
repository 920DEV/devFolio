import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type AvatarSceneProps = {
  /** Accent color (hex string) used for the rim light + glow aura, e.g. from a hovered achievement. */
  accentColor?: string;
  /** Path to the .glb, served from /public — e.g. "/models/avatar.glb" (the default). */
  modelUrl?: string;
  /** Override auto-detection if your clip names don't contain "wave"/"hello"/etc. */
  waveClipName?: string;
  /** Override auto-detection for the looping idle clip. */
  idleClipName?: string;
};

const DEFAULT_ACCENT = "#37d7b2";
const DEFAULT_MODEL_URL = "/character.glb";
const RETRIGGER_COOLDOWN_MS = 1200;
const BUBBLE_VISIBLE_MS = 2400;

// Exporters name clips all kinds of ways ("Waving", "wave_hello", "Armature|Wave"),
// so we match case-insensitively against a few common hints rather than an exact name.
const WAVE_NAME_HINTS = ["wave", "greet", "hello", "hi"];
const IDLE_NAME_HINTS = ["idle", "breath", "stand"];
const HEAD_BONE_NAMES = ["Head", "head", "mixamorigHead", "Bip01_Head", "HeadTop_End"];

function pickClip(clips: THREE.AnimationClip[], hints: string[], explicitName?: string) {
  if (explicitName) {
    return clips.find((clip) => clip.name === explicitName);
  }
  return clips.find((clip) => hints.some((hint) => clip.name.toLowerCase().includes(hint)));
}

function findHeadBone(root: THREE.Object3D): THREE.Object3D | null {
  for (const name of HEAD_BONE_NAMES) {
    const found = root.getObjectByName(name);
    if (found) {
      return found;
    }
  }
  return null;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.32)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function AvatarScene({
  accentColor = DEFAULT_ACCENT,
  modelUrl = DEFAULT_MODEL_URL,
  waveClipName,
  idleClipName,
}: AvatarSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const accentRef = useRef(new THREE.Color(accentColor));
  const waveTriggerRef = useRef<number>(-Infinity);
  const playWaveRef = useRef<(() => void) | null>(null);
  const [showBubble, setShowBubble] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    accentRef.current.set(accentColor);
  }, [accentColor]);

  const triggerWave = () => {
    const now = performance.now();
    if (now - waveTriggerRef.current < RETRIGGER_COOLDOWN_MS) {
      return;
    }
    waveTriggerRef.current = now;
    playWaveRef.current?.();
    setShowBubble(true);
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
    bubbleTimeoutRef.current = setTimeout(() => setShowBubble(false), BUBBLE_VISIBLE_MS);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let disposed = false;
    let animationFrame = 0;
    const cleanupFns: Array<() => void> = [];
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 1.35, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    // ---- Lighting ----
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(1.6, 3, 2.6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(accentRef.current.getHex(), 16, 22);
    rimLight.position.set(-2, 0.6, 1.6);
    scene.add(rimLight);

    // ---- Aura glow behind the avatar ----
    const glowTexture = makeGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: accentRef.current,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(3.6, 3.6, 1);
    glow.position.set(0, 1.2, -1.2);
    root.add(glow);

    // ---- Background particles ----
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 3.6 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 1.2;
      starPositions[i * 3 + 2] = radius * Math.cos(phi) * 0.6 - 1.5;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.014, transparent: true, opacity: 0.4 }),
    );
    scene.add(stars);

    // ---- Model loading ----
    let mixer: THREE.AnimationMixer | null = null;
    let waveAction: THREE.AnimationAction | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let headBone: THREE.Object3D | null = null;
    let modelRoot: THREE.Object3D | null = null;

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) {
          return;
        }
        modelRoot = gltf.scene;

        // Normalize scale/position: fit to a consistent height, feet near the
        // bottom of the stage, since exported models come in wildly different units.
        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const targetHeight = 2.7;
        const scale = targetHeight / Math.max(size.y, 0.001);
        modelRoot.scale.setScalar(scale);
        modelRoot.position.set(
          -center.x * scale,
          -box.min.y * scale - targetHeight * 0.62,
          -center.z * scale,
        );

        root.add(modelRoot);
        headBone = findHeadBone(modelRoot);

        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(modelRoot);
          const waveClip = pickClip(gltf.animations, WAVE_NAME_HINTS, waveClipName);
          const idleClip = pickClip(gltf.animations, IDLE_NAME_HINTS, idleClipName) ?? gltf.animations[0];

          if (idleClip) {
            idleAction = mixer.clipAction(idleClip);
            idleAction.play();
          }

          if (waveClip) {
            waveAction = mixer.clipAction(waveClip);
            waveAction.setLoop(THREE.LoopOnce, 1);
            waveAction.clampWhenFinished = true;

            playWaveRef.current = () => {
              if (!waveAction) return;
              waveAction.reset().fadeIn(0.15).play();
              if (idleAction) {
                idleAction.crossFadeTo(waveAction, 0.15, false);
              }
              const restoreIdle = () => {
                if (idleAction) {
                  idleAction.reset().fadeIn(0.25).play();
                  waveAction!.crossFadeTo(idleAction, 0.25, false);
                }
                mixer?.removeEventListener("finished", restoreIdle);
              };
              mixer?.addEventListener("finished", restoreIdle);
            };
          } else {
            console.warn(
              "[AvatarScene] No clip matched wave/hello/greet — pass `waveClipName` explicitly. Available clips:",
              gltf.animations.map((c) => c.name),
            );
          }
        } else {
          console.warn(
            "[AvatarScene] This .glb has no baked-in animations, so it will only turn toward the cursor (no wave). " +
              "Re-export it with an animation clip included.",
          );
        }
      },
      undefined,
      (error) => {
        console.error("[AvatarScene] Failed to load", modelUrl, error);
        if (!disposed) {
          setLoadError(true);
        }
      },
    );

    // ---- Pointer tracking (look toward cursor anywhere on the page) ----
    const pointer = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const spanX = Math.max(window.innerWidth / 2, 1);
      const spanY = Math.max(window.innerHeight / 2, 1);
      const rect = host.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointer.x = Math.max(-1, Math.min(1, (event.clientX - cx) / spanX));
      pointer.y = Math.max(-1, Math.min(1, (event.clientY - cy) / spanY));
      targetRotation.y = pointer.x * 0.5;
      targetRotation.x = -pointer.y * 0.2;
    };
    window.addEventListener("pointermove", handlePointerMove);
    cleanupFns.push(() => window.removeEventListener("pointermove", handlePointerMove));

    // "Hover around" the avatar (anywhere in the stage, including the ring)
    // re-triggers the wave.
    const hoverZone = host.parentElement ?? host;
    const handlePointerEnter = () => triggerWave();
    hoverZone.addEventListener("pointerenter", handlePointerEnter);
    cleanupFns.push(() => hoverZone.removeEventListener("pointerenter", handlePointerEnter));

    // Initial greeting shortly after mount
    const introTimeout = setTimeout(() => triggerWave(), 700);
    cleanupFns.push(() => clearTimeout(introTimeout));

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      const delta = clock.getDelta();
      const tSec = performance.now() * 0.001;
      mixer?.update(delta);

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;

      if (headBone) {
        // Turn the head/neck bone directly if the model is rigged, plus a
        // gentler turn of the whole body for a natural look.
        headBone.rotation.y = currentRotation.y * 0.7;
        headBone.rotation.x = currentRotation.x * 0.5;
        root.rotation.y = currentRotation.y * 0.12;
      } else {
        // No skeleton found — just turn the whole model.
        root.rotation.y = currentRotation.y;
        root.rotation.x = currentRotation.x;
      }

      root.position.y = Math.sin(tSec * 0.9) * 0.03;

      glow.material.color.lerp(accentRef.current, 0.04);
      rimLight.color.lerp(accentRef.current, 0.04);
      const glowPulse = 1 + Math.sin(tSec * 1.4) * 0.05;
      glow.scale.set(3.6 * glowPulse, 3.6 * glowPulse, 1);

      stars.rotation.y = tSec * 0.015;

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
      mixer?.stopAllAction();
      renderer.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const mat = object.material;
          const materials = Array.isArray(mat) ? mat : [mat];
          materials.forEach((m) => {
            Object.values(m).forEach((value) => {
              if (value instanceof THREE.Texture) {
                value.dispose();
              }
            });
            m.dispose();
          });
        } else if (object instanceof THREE.Points) {
          object.geometry.dispose();
        }
      });
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, waveClipName, idleClipName]);

  return (
    <div className="avatar-stage-inner">
      <div
        className="avatar-scene-shell"
        ref={hostRef}
        aria-label="Animated 3D avatar that waves hello and turns toward your cursor"
      />
      {loadError && (
        <div className="avatar-fallback-note">
          Couldn't load <code>{modelUrl}</code>. Drop your .glb at <code>public{modelUrl}</code>.
        </div>
      )}
      <div className={showBubble ? "avatar-speech-bubble is-visible" : "avatar-speech-bubble"} aria-hidden={!showBubble}>
        Hi <span role="img" aria-label="waving hand">👋</span>
      </div>
    </div>
  );
}
