import { useState, useRef } from "react";
import { ARButton, XR, useXRHitTest, createXRStore } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Object3D, Matrix4 } from "three"; // Import Matrix4

function FurnitureModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/assets/sofa.glb"); // Load sofa model
  return <primitive object={scene} position={position} />;
}

function FloorPlacement({ setPosition }: { setPosition: (pos: [number, number, number]) => void }) {
  const refSpace = useRef<Object3D | null>(null);

  useXRHitTest(
    (hitResults, getWorldMatrix) => {
      if (hitResults.length > 0) {
        const matrix = new Matrix4(); // ✅ Corrected: Use Matrix4 instead of Float32Array
        const success = getWorldMatrix(matrix, hitResults[0]); // Provide two arguments

        if (success) {
          setPosition([matrix.elements[12], matrix.elements[13], matrix.elements[14]]); // Extract world position
        }
      }
    },
    refSpace, // Provide the required reference space
    "plane" // Trackable type: 'plane' detects floors & walls
  );

  return null;
}

export default function WebAR() {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]); // Default position
  const store = createXRStore(); // ✅ Fix: Initialize XR store correctly

  return (
    <>
      <ARButton store={store} /> {/* ✅ Fix: Add store property */}
      <Canvas>
        <XR store={store}> {/* ✅ Fix: Add store property */}
          <FloorPlacement setPosition={setPosition} />
          <FurnitureModel position={position} />
        </XR>
      </Canvas>
    </>
  );
}
