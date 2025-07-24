import { TerminalContextProvider } from "@/renderer/lib/contexts/terminalContext.tsx";
import App from "@/renderer/App.tsx";
import { ThemeProvider } from "./lib/contexts/themeProvider";

import { Routes, Route, HashRouter } from "react-router-dom";
import SettingsPage from './components/Settings';
import AppBar from "@/renderer/components/AppBar.tsx";
import { Toaster } from "@/renderer/components/ui/sonner.tsx";


export default function Wrappers() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TerminalContextProvider>
        <HashRouter>
          <AppBar />
          <Toaster />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </HashRouter>
      </TerminalContextProvider>
    </ThemeProvider>
  )
}
