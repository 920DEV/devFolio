import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitNode } from "../types/portfolio";

type SystemsSceneProps = {
  nodes: OrbitNode[];
  selectedId: OrbitNode["id"];
  onSelect: (id: OrbitNode["id"]) => void;
};

export function SystemsScene({ nodes, selectedId, onSelect }: SystemsSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const keyLight = new THREE.PointLight(0xffffff, 14, 24);
    keyLight.position.set(2, 3, 5);
    scene.add(keyLight);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 2),
      new THREE.MeshStandardMaterial({
        color: 0x101418,
        metalness: 0.55,
        roughness: 0.28,
        emissive: 0x20352f,
        emissiveIntensity: 0.35,
      }),
    );
    group.add(core);

    nodes.forEach((node) => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...node.position),
      ]);
      group.add(
        new THREE.Line(
          lineGeometry,
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.22,
          }),
        ),
      );
    });

    const nodeMeshes = nodes.map((node) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(node.color),
          emissive: new THREE.Color(node.color),
          emissiveIntensity: 0.65,
          metalness: 0.2,
          roughness: 0.25,
        }),
      );
      mesh.position.set(...node.position);
      mesh.userData.id = node.id;
      group.add(mesh);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.31, 0.012, 10, 80),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color),
          transparent: true,
          opacity: 0.58,
        }),
      );
      ring.position.copy(mesh.position);
      ring.lookAt(camera.position);
      group.add(ring);

      return { mesh, ring, node };
    });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i += 1) {
      const radius = 4.4 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.015,
        transparent: true,
        opacity: 0.42,
      }),
    );
    group.add(stars);

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let animationFrame = 0;
    let dragStartX = 0;
    let isDragging = false;
    let manualRotation = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const selectFromEvent = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(nodeMeshes.map(({ mesh }) => mesh))[0];
      if (hit?.object.userData.id) {
        onSelectRef.current(hit.object.userData.id as OrbitNode["id"]);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      dragStartX = event.clientX;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }
      manualRotation += (event.clientX - dragStartX) * 0.004;
      dragStartX = event.clientX;
    };

    const handlePointerUp = (event: PointerEvent) => {
      selectFromEvent(event);
      isDragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const animate = () => {
      const t = performance.now() * 0.001;
      group.rotation.y = t * 0.09 + manualRotation;
      group.rotation.x = Math.sin(t * 0.25) * 0.08;
      core.rotation.x = t * 0.28;
      core.rotation.y = t * 0.2;
      stars.rotation.y = -t * 0.025;

      nodeMeshes.forEach(({ mesh, ring, node }, index) => {
        const active = selectedIdRef.current === node.id;
        const pulse = 1 + Math.sin(t * 2.6 + index) * 0.08;
        mesh.scale.setScalar(active ? 1.55 * pulse : pulse);
        ring.scale.setScalar(active ? 1.45 : 1);
        ring.lookAt(camera.position);
        (ring.material as THREE.MeshBasicMaterial).opacity = active ? 0.9 : 0.42;
      });

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [nodes]);

  return (
    <div className="scene-shell" ref={hostRef} aria-label="Interactive 3D systems map">
      <span className="scene-hint">Drag or tap nodes</span>
    </div>
  );
}
