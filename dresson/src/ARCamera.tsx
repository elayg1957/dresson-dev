import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ARButton, XR, createXRStore, useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

const xrStore = createXRStore(); // WebXR state manager

// 📌 Cube Component (Will be placed on the detected surface)
function Cube({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

// 📌 Reticle Component (Shows where the object will be placed)
function Reticle({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshStandardMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}

// 📌 Hit Test Logic - Detect where to place the cube
function FloorPlacement({
  setPosition,
  setReticlePosition,
}: {
  setPosition: (pos: [number, number, number]) => void;
  setReticlePosition: (pos: [number, number, number]) => void;
}) {
  useXRHitTest((hitResults) => {
    if (hitResults.length > 0) {
      const hitPose = hitResults[0].getPose();
      if (hitPose) {
        const { x, y, z } = hitPose.transform.position;
        setReticlePosition([x, y, z]); // Show reticle where object will be placed
      }
    }
  });

  return null;
}

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]); // Cube position
  const [reticlePosition, setReticlePosition] = useState<[number, number, number]>([0, 0, -2]); // Reticle position
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
        requiredFeatures: ["local-floor", "hit-test"], // Enable object placement
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

  // 📌 Function to place the cube where the reticle is
  const placeObject = () => {
    setPosition([...reticlePosition]);
  };

  return (
    <div>
      {!isARActive && <button onClick={startAR}>Start AR</button>}
      {isARActive && (
        <>
          <ARButton store={xrStore} />
          <Canvas>
            <XR store={xrStore}>
              <FloorPlacement setPosition={setPosition} setReticlePosition={setReticlePosition} />
              <Reticle position={reticlePosition} /> {/* Show reticle */}
              <Cube position={position} /> {/* Place cube when selected */}
            </XR>
          </Canvas>
          <button onClick={placeObject} style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)" }}>
            Place Object
          </button>
        </>
      )}
    </div>
  );
};

export default ARCamera;
