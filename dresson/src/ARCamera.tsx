import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ARButton, XR, createXRStore } from "@react-three/xr";
import * as THREE from "three";

const xrStore = createXRStore(); // Create WebXR store

// 📌 Reticle Component (Initial Static White Circle)
function Reticle() {
  return (
    <mesh position={[0, 0, -2]}>
      <ringGeometry args={[0.15, 0.2, 32]} />
      <meshStandardMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    // Create WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR

    rendererRef.current = renderer;
    document.body.appendChild(renderer.domElement);

    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  const startAR = async () => {
    if (!navigator.xr) {
      alert("WebXR is not supported on this device.");
      return;
    }

    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"], // Position tracking
      });

      // Ensure the WebXR session is attached to the renderer
      if (rendererRef.current) {
        rendererRef.current.xr.setSession(session);
      }

      setIsARActive(true);
      session.addEventListener("end", () => setIsARActive(false));
    } catch (error) {
      alert("Failed to start AR: " + error);
    }
  };

  return (
    <div>
      {!isARActive && <button onClick={startAR}>Start AR</button>}
      {isARActive && (
        <>
          <ARButton store={xrStore} /> {/* This handles session start automatically */}
          <Canvas>
            <XR store={xrStore}>
              <Reticle /> {/* ✅ Static Reticle for now */}
            </XR>
          </Canvas>
        </>
      )}
    </div>
  );
};

export default ARCamera;
