import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ARButton, XR, createXRStore, useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

const xrStore = createXRStore(); // WebXR state manager

// 📌 Cube Component (This will be placed on the detected surface)
function Cube({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

// 📌 Hit Test Logic - Detect where to place the cube
function FloorPlacement({ setPosition }: { setPosition: (pos: [number, number, number]) => void }) {
  useXRHitTest(
    (hitResults, getWorldMatrix) => {
      if (hitResults.length > 0) {
        const matrix = new THREE.Matrix4();
        getWorldMatrix(matrix, hitResults[0]); // Get detected surface position
        setPosition([matrix.elements[12], matrix.elements[13], matrix.elements[14]]);
      }
    },
    { space: "viewer" } // ✅ Pass as an object with space property
  );

  return null;
}

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]); // Default cube position
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
        requiredFeatures: ["local-floor", "hit-test"], // ✅ Ensures surface detection works
      });

      // Attach WebXR session to renderer
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
          <ARButton store={xrStore} />
          <Canvas>
            <XR store={xrStore}> {/* ✅ Ensure reference space is set */}
              <FloorPlacement setPosition={setPosition} /> {/* ✅ Detects ground */}
              <Cube position={position} /> {/* ✅ Places cube on detected position */}
            </XR>
          </Canvas>
        </>
      )}
    </div>
  );
};

export default ARCamera;
