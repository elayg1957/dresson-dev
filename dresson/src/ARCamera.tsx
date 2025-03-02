import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ARButton, XR, useXRHitTest, createXRStore } from "@react-three/xr";
import * as THREE from "three";

const xrStore = createXRStore(); // Create WebXR store

//  Simple Cube that will be placed on the floor
function Cube({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} /> {/* Cube size */}
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

//  Hit Test Logic to detect where the cube should be placed
function FloorPlacement({ setPosition }: { setPosition: (pos: [number, number, number]) => void }) {
  useXRHitTest(
    (hitResults, getWorldMatrix) => {
      if (hitResults.length > 0) {
        const matrix = new THREE.Matrix4();
        getWorldMatrix(matrix, hitResults[0]);
        setPosition([matrix.elements[12], matrix.elements[13], matrix.elements[14]]); // Extract position
      }
    },
    "local-floor" //  Provide reference space
  );

  return null;
}

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]); // Default cube position

  const startAR = async () => {
    if (!navigator.xr) {
      alert("WebXR is not supported on this device.");
      return;
    }

    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor", "hit-test"], // Enable object placement
      });

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
          <ARButton store={xrStore} /> {/* Enables AR mode */}
          <Canvas>
            <XR store={xrStore}>
              <FloorPlacement setPosition={setPosition} /> {/* Detects ground */}
              <Cube position={position} /> {/* Places the cube */}
            </XR>
          </Canvas>
        </>
      )}
    </div>
  );
};

export default ARCamera;
