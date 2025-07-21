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

  const [terminalColorClass, setTerminalColorClass] = useState<string>(
    'text-cyan-400'
  )

  const handleToggleLatencyWidget = (): void => {
    setLatencyWidgetVisible((prev) => !prev)
  }


  return (
    <div className={`app-container ${terminalColorClass}`}>
      <AppBar isLatencyWidgetVisible={isLatencyWidgetVisible} />
      <Terminal
        terminalColorClass={terminalColorClass}
        setTerminalColorClass={setTerminalColorClass}
        onToggleLatencyWidget={handleToggleLatencyWidget}
      />
    </div>
  );
}

export default App
