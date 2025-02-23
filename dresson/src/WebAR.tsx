import { ARButton, XR, createXRStore } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";

export default function WebAR() {
  const store = createXRStore(); // XR state manager

  return (
    <>
      {/* Button to Enter AR Mode */}
      <ARButton store={store} />

      {/* 3D Scene with AR Mode Enabled */}
      <Canvas>
        <XR store={store}>
          {/* No models yet, just opening the camera */}
        </XR>
      </Canvas>
    </>
  );
}
