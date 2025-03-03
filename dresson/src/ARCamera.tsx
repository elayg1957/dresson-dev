import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, useXRHitTest, createXRStore } from "@react-three/xr";
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

// 📌 Reticle - Shows where the object will be placed
function Reticle({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} visible={position[1] !== -1000}>
      <ringGeometry args={[0.15, 0.2, 32]} />
      <meshStandardMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}

// 📌 Hit Test - Detect where to place the cube
function FloorPlacement({
  setPosition,
  setReticlePosition,
}: {
  setPosition: (pos: [number, number, number]) => void;
  setReticlePosition: (pos: [number, number, number]) => void;
}) {
  const referenceSpace = useRef<THREE.Object3D | null>(null); // Correct reference type

  useXRHitTest(
    (hitResults) => {
      if (hitResults.length > 0) {
        const hitPose = hitResults[0].getPose(referenceSpace.current as XRSpace);
        if (hitPose) {
          const { x, y, z } = hitPose.transform.position;
          setReticlePosition([x, y, z]); // Move reticle to detected surface
        }
      }
    },
    referenceSpace // Pass a valid reference space
  );

  return null;
}

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]); // Default cube position
  const [reticlePosition, setReticlePosition] = useState<[number, number, number]>([0, -1000, 0]); // Hidden initially
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

  // Function to place the cube where the reticle is
  const PlaceObject = () => {
    setPosition([...reticlePosition]); // Move cube to reticle position
  };

  return (
    <div>
      {!isARActive && <button onClick={startAR}>Start AR</button>}
      {isARActive && (
        <>
          <button onClick={PlaceObject}>Place Cube</button>
          <Canvas>
            <XR store={xrStore}>
              <FloorPlacement setPosition={setPosition} setReticlePosition={setReticlePosition} /> {/* Detects ground */}
              <Reticle position={reticlePosition} /> {/* Reticle shows detected surface */}
              <Cube position={position} /> {/* Places cube on detected position */}
            </XR>
          </Canvas>
        </>
      )}
    </div>
  );
};

export default ARCamera;
