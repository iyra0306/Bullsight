import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Pre-allocated helpers to prevent GC allocations in the animation loop
const _dummy = new THREE.Object3D();
const _targetColor = new THREE.Color();

export const HeroThreeScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x101512, 0.055);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0.5, 2.8, 10.2);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio environment reflection for metallic & glass elements
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-point + warm/cool rig
    const hemiLight = new THREE.HemisphereLight(0xa5ebc3, 0x101512, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xe8f0ea, 2.2);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x36c982, 3.8, 22);
    rimLight.position.set(-4.5, 2.5, 4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Base architectural data grid
    const gridHelper = new THREE.GridHelper(18, 28, 0x36c982, 0x214b37);
    gridHelper.position.y = -2.1;
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.25;
    rootGroup.add(gridHelper);

    // Composite multi-part 3D candlestick sculptures
    const candleGroup = new THREE.Group();
    rootGroup.add(candleGroup);

    const bullMat = new THREE.MeshPhysicalMaterial({
      color: 0x36c982,
      emissive: 0x124e31,
      emissiveIntensity: 0.45,
      metalness: 0.35,
      roughness: 0.22,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    });

    const bearMat = new THREE.MeshPhysicalMaterial({
      color: 0x26382f,
      emissive: 0x0c1410,
      metalness: 0.65,
      roughness: 0.3,
      clearcoat: 0.6,
    });

    const wickMat = new THREE.MeshStandardMaterial({
      color: 0xa5ebc3,
      metalness: 0.85,
      roughness: 0.18,
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe8f0ea,
      metalness: 0.9,
      roughness: 0.15,
    });

    const candleCount = isMobile ? 10 : 15;
    const candleItems: {
      group: THREE.Group;
      baseY: number;
      phase: number;
      amp: number;
    }[] = [];

    const geoBody = new THREE.BoxGeometry(0.36, 1, 0.36);
    const geoWick = new THREE.CylinderGeometry(0.028, 0.028, 1, 10);
    const geoCap = new THREE.BoxGeometry(0.42, 0.05, 0.42);

    const heights = [0.9, 1.3, 1.1, 1.75, 1.5, 2.1, 1.85, 2.45, 2.0, 2.65, 2.9, 2.4, 3.1, 3.4, 3.25];

    for (let i = 0; i < candleCount; i++) {
      const t = i / (candleCount - 1);
      const x = (t - 0.5) * (isMobile ? 6.4 : 8.6);
      const z = Math.sin(t * Math.PI * 1.6) * 0.95;
      const bodyH = heights[i % heights.length] * 0.68;
      const isBull = i % 4 !== 2;

      const unit = new THREE.Group();
      const body = new THREE.Mesh(geoBody, isBull ? bullMat : bearMat);
      body.scale.y = bodyH;
      body.castShadow = !isSoftwareGl;
      body.receiveShadow = !isSoftwareGl;

      const upperWick = new THREE.Mesh(geoWick, wickMat);
      upperWick.scale.y = 0.55 + (i % 3) * 0.18;
      upperWick.position.y = bodyH * 0.5 + upperWick.scale.y * 0.5;

      const lowerWick = new THREE.Mesh(geoWick, wickMat);
      lowerWick.scale.y = 0.42 + (i % 2) * 0.2;
      lowerWick.position.y = -(bodyH * 0.5 + lowerWick.scale.y * 0.5);

      const topCap = new THREE.Mesh(geoCap, capMat);
      topCap.position.y = bodyH * 0.5 + 0.025;

      const bottomCap = new THREE.Mesh(geoCap, capMat);
      bottomCap.position.y = -(bodyH * 0.5 + 0.025);

      unit.add(body, upperWick, lowerWick, topCap, bottomCap);

      const baseY = -0.75 + t * 1.9 + Math.sin(t * 4) * 0.22;
      unit.position.set(x, baseY, z);
      candleGroup.add(unit);
      candleItems.push({
        group: unit,
        baseY,
        phase: i * 0.55,
        amp: 0.08 + (i % 3) * 0.02,
      });
    }

    // Neural predictive spline trajectory floating above the candles
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = (t - 0.5) * (isMobile ? 7.2 : 9.4);
      const y = -0.3 + t * 2.5 + Math.sin(t * Math.PI * 2.2) * 0.35;
      const z = Math.sin(t * Math.PI * 1.6) * 0.95 + 0.55;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const spline = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(spline, 64, 0.032, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xa5ebc3,
      emissive: 0x36c982,
      emissiveIntensity: 0.9,
      metalness: 0.3,
      roughness: 0.2,
    });
    const trendSpline = new THREE.Mesh(tubeGeo, tubeMat);
    rootGroup.add(trendSpline);

    // Neural network nodes along orbital lattice
    const nodeGeo = new THREE.IcosahedronGeometry(0.095, 1);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xa5ebc3,
      emissive: 0x36c982,
      emissiveIntensity: 1.1,
      metalness: 0.4,
      roughness: 0.2,
    });
    const nodeCount = isMobile ? 12 : 20;
    const nodeInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const nodePositions: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const pt = spline.getPointAt(i / (nodeCount - 1));
      const offsetPt = new THREE.Vector3(
        pt.x,
        pt.y + (i % 2 === 0 ? 0.45 : -0.38),
        pt.z + (i % 3 === 0 ? 0.5 : -0.4)
      );
      nodePositions.push(offsetPt);
      _dummy.position.copy(offsetPt);
      _dummy.scale.setScalar(i % 4 === 0 ? 1.35 : 0.85);
      _dummy.updateMatrix();
      nodeInstanced.setMatrixAt(i, _dummy.matrix);
    }
    nodeInstanced.computeBoundingSphere();
    rootGroup.add(nodeInstanced);

    // Connect neural lattice nodes with crisp hairline filaments
    const linePositions: number[] = [];
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const a = nodePositions[i];
      const b = nodePositions[i + 1];
      linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      if (i + 2 < nodePositions.length && i % 2 === 0) {
        const c = nodePositions[i + 2];
        linePositions.push(a.x, a.y, a.z, c.x, c.y, c.z);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x36c982,
      transparent: true,
      opacity: 0.36,
    });
    const neuralFilaments = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(neuralFilaments);

    // Glowing green particles (InstancedMesh)
    const particleCount = isMobile ? 48 : 96;
    const particleGeo = new THREE.SphereGeometry(0.032, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x36c982,
      transparent: true,
      opacity: 0.72,
    });
    const particles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    const particleSeeds: { x: number; y: number; z: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      const px = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 11 - 5.5;
      const py = ((Math.sin(i * 78.233) * 19341.123) % 1) * 5 - 1.5;
      const pz = ((Math.sin(i * 39.425) * 28471.91) % 1) * 6 - 3;
      particleSeeds.push({
        x: Math.abs(px) > 6 ? 0 : px,
        y: Math.abs(py) > 4 ? 0.5 : py,
        z: Math.abs(pz) > 4 ? 0 : pz,
        speed: 0.35 + (i % 5) * 0.12,
        phase: i * 0.4,
      });
      _dummy.position.set(px, py, pz);
      _dummy.scale.setScalar(0.6 + (i % 4) * 0.25);
      _dummy.updateMatrix();
      particles.setMatrixAt(i, _dummy.matrix);
      _targetColor.setHex(i % 3 === 0 ? 0xa5ebc3 : 0x36c982);
      particles.setColorAt(i, _targetColor);
    }
    particles.frustumCulled = false;
    rootGroup.add(particles);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Mouse parallax target
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerTarget.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerTarget.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (!reducedMotion) {
        pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4, delta);
        pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4, delta);

        rootGroup.rotation.y = pointerCurrent.x * 0.22 + Math.sin(elapsed * 0.25) * 0.06;
        rootGroup.rotation.x = pointerCurrent.y * 0.1;

        for (let i = 0; i < candleItems.length; i++) {
          const item = candleItems[i];
          item.group.position.y =
            item.baseY + Math.sin(elapsed * 1.15 + item.phase) * item.amp;
        }

        for (let i = 0; i < particleCount; i++) {
          const ps = particleSeeds[i];
          _dummy.position.set(
            ps.x,
            ps.y + Math.sin(elapsed * ps.speed + ps.phase) * 0.25,
            ps.z
          );
          _dummy.scale.setScalar(0.6 + (i % 4) * 0.2);
          _dummy.updateMatrix();
          particles.setMatrixAt(i, _dummy.matrix);
        }
        particles.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (reducedMotion) return; // Render once cleanly when reduced motion is preferred
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      geoBody.dispose();
      geoWick.dispose();
      geoCap.dispose();
      tubeGeo.dispose();
      nodeGeo.dispose();
      lineGeo.dispose();
      particleGeo.dispose();

      bullMat.dispose();
      bearMat.dispose();
      wickMat.dispose();
      capMat.dispose();
      tubeMat.dispose();
      nodeMat.dispose();
      lineMat.dispose();
      particleMat.dispose();
      gridMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`h-full w-full ${className}`}
      aria-label="Interactive 3D financial candlestick and neural trajectory visualization"
    />
  );
};
