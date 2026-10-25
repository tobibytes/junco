// Builds public/speaker.glb: a small, original product model for the ModelViewer demo.
// Run from this folder: node scripts/make-model.mjs
import { writeFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// GLTFExporter reads Blobs with FileReader, which Node lacks.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buf).toString("base64")}`;
      this.onloadend?.();
    });
  }
};

const scene = new THREE.Scene();
const fabric = new THREE.MeshStandardMaterial({ color: 0x575b62, roughness: 0.92, metalness: 0, name: "Fabric" });
const shell = new THREE.MeshStandardMaterial({ color: 0xe9e7e2, roughness: 0.35, metalness: 0.05, name: "Shell" });
const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.22, metalness: 0.9, name: "Metal" });
const light = new THREE.MeshStandardMaterial({
  color: 0x3b6cff,
  emissive: 0x3b6cff,
  emissiveIntensity: 1.6,
  roughness: 0.4,
  name: "RingLight",
});

// fabric body with a gently rounded profile
const profile = [];
for (let i = 0; i <= 24; i++) {
  const t = i / 24;
  const y = t * 1.6;
  const r = 0.62 + Math.sin(t * Math.PI) * 0.05;
  profile.push(new THREE.Vector2(r, y));
}
const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), fabric);
body.name = "Body";
body.position.y = 0.12;
scene.add(body);

// solid top cap
const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 64), shell);
cap.name = "Cap";
cap.position.y = 1.76;
scene.add(cap);

// glowing ring light inset into the cap
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 12, 96), light);
ring.name = "Ring";
ring.rotation.x = Math.PI / 2;
ring.position.y = 1.805;
scene.add(ring);

// four touch buttons on the cap
for (let i = 0; i < 4; i++) {
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24), metal);
  const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
  button.position.set(Math.cos(a) * 0.2, 1.81, Math.sin(a) * 0.2);
  button.name = `Button${i}`;
  scene.add(button);
}

// metal base
const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.56, 0.12, 64), metal);
base.name = "Base";
base.position.y = 0.06;
scene.add(base);

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, { binary: true });
writeFileSync(new URL("../public/speaker.glb", import.meta.url), Buffer.from(glb));
console.log(`wrote public/speaker.glb (${glb.byteLength} bytes)`);
