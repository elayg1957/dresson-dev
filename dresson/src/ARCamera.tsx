import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ARButton, XR, useXRHitTest, createXRStore } from "@react-three/xr";
import * as THREE from "three";

const xrStore = createXRStore(); // WebXR state manager

// 📌 Cube Component (Will be placed on detected surfaces)
function Cube({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

// 📌 Reticle - Indicator for object placement
function Reticle({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} visible={position[1] !== -1000}>
      <ringGeometry args={[0.15, 0.2, 32]} />
      <meshStandardMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}

// 📌 Hit Testing & Anchoring
function FloorPlacement({
                          setReticlePosition,
}: {
  setPosition: (pos: [number, number, number]) => void;
  setReticlePosition: (pos: [number, number, number]) => void;
}) {
  const referenceSpace = useRef<XRReferenceSpace | null>(null); // XR reference space

  useXRHitTest(
    (hitResults) => {
      if (hitResults.length > 0) {
        const hitPose = hitResults[0].getPose(referenceSpace.current!);
        if (hitPose) {
          const { x, y, z } = hitPose.transform.position;
          setReticlePosition([x, y, z]); // Move the reticle
        }
      }
    },
    "viewer" // Use viewer space for hit testing
  );

  return null;
}

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]); // Default cube position
  const [reticlePosition, setReticlePosition] = useState<[number, number, number]>([0, 0, -1000]);

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
        requiredFeatures: ["local-floor", "hit-test"], // Enable hit test
      });

      if (rendererRef.current) {
        rendererRef.current.xr.setSession(session);
      }

      setIsARActive(true);
      session.addEventListener("end", () => setIsARActive(false));
    } catch (error) {
      alert("Failed to start AR: " + error);
    }
  };

  // 📌 Function to Place Object at Reticle Position
  const placeObject = () => {
    setPosition([...reticlePosition]); // Move cube to reticle position
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
              <Reticle position={reticlePosition} />
              <Cube position={position} />
            </XR>
          </Canvas>
          <button onClick={placeObject}>Place Object</button> {/* Button to place cube */}
        </>
      )}
    </div>
  );
};

export default ARCamera;
