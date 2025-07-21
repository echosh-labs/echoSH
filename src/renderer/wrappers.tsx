import { TerminalContextProvider } from "@/renderer/lib/contexts/terminalContext.tsx";
import App from "@/renderer/App.tsx";

export default function Wrappers() {
  return (
    <TerminalContextProvider>
      <App/>
    </TerminalContextProvider>
  )
}
