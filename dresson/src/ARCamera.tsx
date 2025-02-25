import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";

const xrStore = createXRStore(); // Create XR store

const ARCamera: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);

  const startAR = async () => {
    if (navigator.xr) {
      try {
        const session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["local-floor"], // Tracks position relative to the ground
        });
        setIsARActive(true);
        session.addEventListener("end", () => setIsARActive(false));
      } catch (error) {
        alert("Failed to start AR: " + error);
      }
    } else {
      alert("WebXR not supported on this device.");
    }
  };

  return (
    <div>
      {!isARActive && <button onClick={startAR}>Start AR</button>}
      {isARActive && (
        <Canvas>
          <XR store={xrStore} />
        </Canvas>
      )}
    </div>
  );
};

export default ARCamera;
