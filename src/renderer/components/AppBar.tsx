import { LatencyWidget } from "@/renderer/components/LatencyWidget.tsx";

export default function AppBar({
                                 isLatencyWidgetVisible
                               }: {
  isLatencyWidgetVisible: boolean;
}) {


  return (
    <div className="app-bar flex justify-between">
      <div className="p-2 h-full">
        <h2 className="pl-2 font-light">Sirocco v0.2.0 - Click to start audio.</h2>
      </div>
      <LatencyWidget isVisible={isLatencyWidgetVisible} />
    </div>
  )
}
