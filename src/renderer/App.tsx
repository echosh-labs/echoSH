// src/renderer/src/App.tsx

import React, { useState } from 'react'
import { Terminal } from './components/Terminal'
import './assets/App.css'
import AppBar from "@/renderer/components/AppBar.tsx";

/**
 * @file App.tsx
 * @description The root component of the React application.
 * It manages the state for the latency widget and renders the main UI.
 */
function App(): React.ReactElement {
  const [isLatencyWidgetVisible, setLatencyWidgetVisible] = useState(false)

  const handleToggleLatencyWidget = (): void => {
    setLatencyWidgetVisible((prev) => !prev)
  }

  return (
    <div className="app-container">
      <AppBar isLatencyWidgetVisible={isLatencyWidgetVisible}/>
      <Terminal onToggleLatencyWidget={handleToggleLatencyWidget} />
    </div>
  )
}

export default App
