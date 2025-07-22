import { LatencyWidget } from "@/renderer/components/LatencyWidget.tsx";
import { useTerminalContext } from "@/renderer/lib/contexts/terminalContext.tsx";

export default function AppBar({
                                 isLatencyWidgetVisible
                               }: {
  isLatencyWidgetVisible: boolean;
}) {

  const { arch } = useTerminalContext();

  return (
    <div
      style={{
        paddingLeft: arch === 'darwin' ? 70 : 0,
        paddingRight: arch === 'darwin' ? 0 : 150,
      }}
      className="app-bar flex justify-between border-b-[0.5px] border-b-[var(--border)] text-nowrap overflow-visible">
      <div className="p-2 h-full" style={{
        display: "flex",
        flexDirection: arch === 'darwin' ? 'row-reverse' : 'row',
      }}>
        <div>Sirocco v0.2.0 - Click to start audio.</div>
      </div>
      <LatencyWidget isVisible={isLatencyWidgetVisible} />
    </div>
  )
}
