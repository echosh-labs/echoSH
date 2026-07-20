import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/renderer/components/ui/form.tsx";
import { useForm } from "react-hook-form";
import { AppSettings } from "@/renderer/types/app.ts";
import { useTerminalContext } from "@/renderer/lib/contexts/terminalContext.tsx";
import AudioDeviceSelect from "@/renderer/components/inputs/audioDevice.tsx";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select.tsx";
import { useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { applyStyleSettings, FONT_OPTIONS, STYLE_DEFAULTS } from "@/renderer/lib/styleSettings.ts";
import {
  DEFAULT_PROVIDER,
  DEFAULT_TOKEN_LIMIT,
  PROVIDER_OPTIONS,
  providerOption,
  TOKEN_LIMIT_OPTIONS,
} from "@/renderer/types/claude.ts";

export default function Settings() {

  const [saving, setSaving] = useState(false);

  const terminalContext = useTerminalContext();

  const form = useForm<AppSettings>({
    defaultValues: { ...STYLE_DEFAULTS, ...terminalContext.settings }
  });

  useEffect(() => {
    form.reset({ ...STYLE_DEFAULTS, ...terminalContext.settings });
  }, [terminalContext.settings]);

  // Live preview: push every edit to the glass CSS variables as the user
  // adjusts the controls, so changes are visible before saving.
  useEffect(() => {
    const sub = form.watch((values) => applyStyleSettings(values as Partial<AppSettings>));
    return () => sub.unsubscribe();
  }, [form]);

  // Which provider's key/model fields the single set of controls is editing.
  const providerId = form.watch("aiProvider") ?? DEFAULT_PROVIDER;
  const activeProvider = providerOption(providerId);

  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  /**
   * Model lists come from the provider's own API rather than a hardcoded table,
   * so the dropdown can't go stale. Main fetches using the key already on disk,
   * which is why a freshly typed key has to be saved before this will work.
   */
  const loadModels = useCallback(() => {
    setLoadingModels(true);
    setModelsError(null);
    window.BRIDGE.listModels(activeProvider.id)
      .then(setModels)
      .catch((reason: unknown) => {
        setModels([]);
        setModelsError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => setLoadingModels(false));
  }, [activeProvider.id]);

  // Refetch when the provider changes; each has its own list and key.
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const modelsStatus = loadingModels
    ? "Loading models…"
    : modelsError ?? (models.length ? "Select a model" : "No models available");

  // If the user leaves without saving, revert the preview to the saved values.
  const savedSettings = useRef(terminalContext.settings);
  savedSettings.current = terminalContext.settings;
  useEffect(() => () => applyStyleSettings(savedSettings.current), []);

  function handleSubmit(data: AppSettings) {
    setSaving(true);
    window.BRIDGE.saveSettings(data)
      .then(() => {
        // Propagate into the app so the styling sticks after leaving the page.
        terminalContext.setSettings(data);
        form.reset(data);
        toast.success("Settings updated successfully.");
      })
      .catch((reason) => {
        toast.error((reason as Error).message);
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <div className="settings-widget p-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
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

          <div className="pt-1 text-xs uppercase tracking-widest text-output">AI</div>

          <FormField
            control={form.control}
            name="aiProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? DEFAULT_PROVIDER}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <p className="text-xs text-output">
                  Backs the <code>claude</code> command. Switching starts a new conversation.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={activeProvider.keyField}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{activeProvider.label} API Key</FormLabel>
                <FormControl>
                  <input
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={(field.value as string) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--glass-accent)]"
                  />
                </FormControl>
                <p className="text-xs text-output">
                  Get one at {activeProvider.keyHint}. Keys are kept per provider.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={activeProvider.modelField}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Select
                      value={(field.value as string) ?? ""}
                      onValueChange={field.onChange}
                      disabled={!models.length}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={modelsStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={loadModels}
                      disabled={loadingModels}
                    >
                      {loadingModels ? <Loader2 className="animate-spin" /> : "Refresh"}
                    </Button>
                  </div>
                </FormControl>
                <p className="text-xs text-output">
                  Fetched live from {activeProvider.label}. Save a new key before refreshing —
                  the list is fetched with the key already on disk.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="claudeMaxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Limit</FormLabel>
                <FormControl>
                  {/* Select works in strings; the setting is a number. */}
                  <Select
                    value={String(field.value ?? DEFAULT_TOKEN_LIMIT)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Response limit" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKEN_LIMIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <p className="text-xs text-output">
                  Caps reasoning and reply together. Longer limits cost more and take longer.
                </p>
              </FormItem>
            )}
          />

          <div className="pt-1 text-xs uppercase tracking-widest text-output">Appearance</div>

          <div className="flex gap-6">
            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent</FormLabel>
                  <FormControl>
                    <input
                      type="color"
                      value={field.value ?? STYLE_DEFAULTS.accentColor}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="glassColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glass Tint</FormLabel>
                  <FormControl>
                    <input
                      type="color"
                      value={field.value ?? STYLE_DEFAULTS.glassColor}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="glassOpacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Glass Opacity — {Math.round((field.value ?? STYLE_DEFAULTS.glassOpacity) * 100)}%</FormLabel>
                <FormControl>
                  <input
                    type="range"
                    min={0.2}
                    max={0.95}
                    step={0.01}
                    value={field.value ?? STYLE_DEFAULTS.glassOpacity}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="w-full accent-[var(--glass-accent)]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cornerRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corner Radius — {field.value ?? STYLE_DEFAULTS.cornerRadius}px</FormLabel>
                <FormControl>
                  <input
                    type="range"
                    min={0}
                    max={28}
                    step={1}
                    value={field.value ?? STYLE_DEFAULTS.cornerRadius}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="w-full accent-[var(--glass-accent)]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fontFamily"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terminal Font</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f.label} value={f.value} style={{ fontFamily: f.value }}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <Button variant="secondary" type="submit" disabled={saving || !form.formState.isDirty}>
            Save Settings
            {saving && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </div>
  );
}
