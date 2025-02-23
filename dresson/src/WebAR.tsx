import { useState } from "react";
import { ARButton, XR, useHitTest } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function FurnitureModel({ position }) {
  const { scene } = useGLTF("/assets/sofa.glb"); // Load sofa model
  return <primitive object={scene} position={position} />;
}

function FloorPlacement({ setPosition }) {
  useHitTest((hitMatrix) => {
    setPosition(hitMatrix.elements.slice(12, 15)); // Extracts real-world position
  });

  return null;
}

export default function WebAR() {
  const [position, setPosition] = useState([0, 0, -2]); // Default position

  return (
    <>
      <ARButton />
      <Canvas>
        <XR>
          <FloorPlacement setPosition={setPosition} />
          <FurnitureModel position={position} />
        </XR>
      </Canvas>
    </>
  );
}
