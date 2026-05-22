import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { MEDIA_POOL, type MediaItem } from './media';

const PARTICLE_COUNT = 100;
const UNIVERSE_RADIUS = 40;
const PLANE_SIZE = 4;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    gl_FragColor = vec4(tex.rgb, tex.a);
  }
`;

type ParticleTexture = {
  texture: THREE.Texture;
  video?: HTMLVideoElement;
};

function loadImageTexture(
  url: string,
  loader: THREE.TextureLoader,
): ParticleTexture {
  const texture = loader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return { texture };
}

function loadVideoTexture(url: string): ParticleTexture {
  const video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  void video.play().catch(() => {});

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return { texture, video };
}

function buildMediaCache(): Map<string, ParticleTexture> {
  const cache = new Map<string, ParticleTexture>();
  const loader = new THREE.TextureLoader();
  for (const item of MEDIA_POOL) {
    if (cache.has(item.url)) continue;
    cache.set(
      item.url,
      item.type === 'image'
        ? loadImageTexture(item.url, loader)
        : loadVideoTexture(item.url),
    );
  }
  return cache;
}

function pickMedia(): MediaItem {
  return MEDIA_POOL[Math.floor(Math.random() * MEDIA_POOL.length)];
}

function randomPosition(): THREE.Vector3 {
  return new THREE.Vector3(
    (Math.random() - 0.5) * UNIVERSE_RADIUS * 2,
    (Math.random() - 0.5) * UNIVERSE_RADIUS * 2,
    (Math.random() - 0.5) * UNIVERSE_RADIUS * 2,
  );
}

export default function Universe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, UNIVERSE_RADIUS * 1.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.4;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 200;

    const sharedGeometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const mediaCache = buildMediaCache();
    const materials: THREE.ShaderMaterial[] = [];
    const particles: THREE.Mesh[] = [];
    const tweens: gsap.core.Tween[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const media = pickMedia();
      const cached = mediaCache.get(media.url);
      if (!cached) continue;

      const material = new THREE.ShaderMaterial({
        uniforms: { uMap: { value: cached.texture } },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });
      materials.push(material);

      const mesh = new THREE.Mesh(sharedGeometry, material);
      mesh.position.copy(randomPosition());
      mesh.lookAt(camera.position);
      scene.add(mesh);
      particles.push(mesh);

      tweens.push(
        gsap.to(mesh.position, {
          x: mesh.position.x + (Math.random() - 0.5) * 4,
          y: mesh.position.y + (Math.random() - 0.5) * 4,
          z: mesh.position.z + (Math.random() - 0.5) * 4,
          duration: 4 + Math.random() * 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 2,
        }),
      );

      tweens.push(
        gsap.to(mesh.rotation, {
          z: mesh.rotation.z + (Math.random() < 0.5 ? -1 : 1) * Math.PI * 2,
          duration: 20 + Math.random() * 30,
          ease: 'none',
          repeat: -1,
        }),
      );
    }

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      for (const mesh of particles) {
        mesh.lookAt(camera.position);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);

      for (const tween of tweens) tween.kill();

      controls.dispose();

      for (const mesh of particles) scene.remove(mesh);
      for (const material of materials) material.dispose();
      sharedGeometry.dispose();

      for (const { texture, video } of mediaCache.values()) {
        texture.dispose();
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
      }
      mediaCache.clear();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="universe" />;
}
