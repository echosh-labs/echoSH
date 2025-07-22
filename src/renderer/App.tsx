// src/renderer/src/App.tsx

import React from "react";
import { Terminal } from './components/Terminal'
import './assets/App.css'

/**
 * @file App.tsx
 * @description The root component of the React application.
 * It manages the state for the latency widget and renders the main UI.
 */
function App(): React.ReactElement {
  return (
    <div className={`app-container`}>
      <Terminal />
    </div>
  );
}

export default App
