import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/renderer/components/ui/form.tsx";
import { useForm } from "react-hook-form";
import { AppSettings } from "@/renderer/types/app.ts";
import { useTerminalContext } from "@/renderer/lib/contexts/terminalContext.tsx";
import AudioDeviceSelect from "@/renderer/components/inputs/audioDevice.tsx";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const terminalContext = useTerminalContext();

  const form = useForm<AppSettings>({
    defaultValues: terminalContext.settings
  });

  useEffect(() => {
    form.reset(terminalContext.settings);
  }, [terminalContext.settings]);

  function handleSubmit(data: AppSettings) {
    setSaving(true);
    window.BRIDGE.saveSettings(data)
      .then(() => {
        toast.success("Settings updated successfully.");
      })
      .catch((reason) => {
        toast.error((reason as Error).message);
      })
      .finally(() => {
        setSaving(false);
        setChanged(false);
      });
  }

  return (
    <div className="settings-widget p-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3"
          onChange={() => setChanged(true)}
        >
          <FormField
            control={form.control}
            name="outputDevice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Device</FormLabel>
                <FormControl>
                  <AudioDeviceSelect
                    {...field}
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="secondary" type="submit" disabled={saving || !changed}>
            Save Settings
            {saving && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </div>
  );
}
