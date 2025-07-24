import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/renderer/components/ui/select.tsx";
import { useEffect, useState } from "react";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

export default function AudioDeviceSelect({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    window.navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter((d) => d.kind === "audiooutput");

      setDevices(audioDevices);
    });
  }, []);

  useEffect(() => {
    if (devices.length > 0 && !props.value) {
      props.onValueChange && props.onValueChange(devices[0].deviceId);
    }
  }, [devices]);

  return (
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder={"Default Audio Device"} />
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
