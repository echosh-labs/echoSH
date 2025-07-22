import { LatencyWidget } from "@/renderer/components/LatencyWidget.tsx";
import { useTerminalContext } from "@/renderer/lib/contexts/terminalContext.tsx";
import { Button } from "@/renderer/components/ui/button.tsx";
import { Home, Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AppBar() {

  const {
    arch,
    latency
  } = useTerminalContext();

  const { pathname } = useLocation();

  return (
    <div
      style={{
        paddingLeft: arch === "darwin" ? 70 : 0,
        paddingRight: arch === "darwin" ? 0 : 150
      }}
      className="app-bar sticky top-0 flex justify-between border-b border-accent text-nowrap overflow-visible"
    >
      <div
        className={`p-2 h-full w-full flex items-center justify-between`}
      >
        <h1 className="text-lg font-bold text-shadow-background pl-2">Sirocco v0.2.0</h1>
        {latency && (<LatencyWidget />)}
        {pathname === "/settings" && (
          <Link to="">
            <Button variant="ghost">
              <Home/>
            </Button>
          </Link>
        )}
        {pathname === "/" && (
          <Link to="/settings">
            <Button variant="ghost">
              <Settings2 />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
