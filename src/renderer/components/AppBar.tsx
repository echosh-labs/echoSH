import { LatencyWidget } from "@/renderer/components/LatencyWidget.tsx";

export default function AppBar({
                                 isLatencyWidgetVisible
                               }: {
  isLatencyWidgetVisible: boolean;
}) {


  return (
    <div className="app-bar flex justify-between border-b-[0.5px] border-b-[var(--border)]">
      <div className="p-2 h-full">
        <div>Sirocco v0.2.0 - Click to start audio.</div>
      </div>
      <LatencyWidget isVisible={isLatencyWidgetVisible} />
    </div>
  )
}
