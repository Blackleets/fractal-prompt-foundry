import { useState } from "react";
import { Brain, Gauge, Save, Settings2, Trash2, TriangleAlert, X } from "lucide-react";
import { DEFAULT_MODEL_CONFIGS, PROVIDER_MODELS, clearModelConfig, saveModelConfig } from "@/lib/models";
import type { ModelConfig, ModelProviderId } from "@/lib/models";
import type { EvolutionConfig } from "@/lib/types";

function validateModelConfig(cfg: ModelConfig): string | null {
  if (cfg.provider === "local") return null;
  if (!PROVIDER_MODELS[cfg.provider]?.includes(cfg.model)) return "Modelo no permitido para este provider.";
  const key = cfg.apiKey.trim();
  if (!key) return "Falta API key (BYOK).";
  if (key.length < 20) return "API key demasiado corta.";
  if (cfg.provider === "openai" && !key.startsWith("sk-")) return "OpenAI key suele empezar por sk-.";
  if (cfg.provider === "anthropic" && !key.startsWith("sk-ant-")) return "Anthropic key suele empezar por sk-ant-.";
  try {
    const url = new URL(cfg.baseUrl);
    if (url.protocol !== "https:" && !(cfg.provider === "ollama" && (url.hostname === "localhost" || url.hostname === "127.0.0.1"))) {
      return "Base URL debe ser https (salvo Ollama local).";
    }
  } catch {
    return "Base URL inválida.";
  }
  if (!(cfg.temperature >= 0 && cfg.temperature <= 2)) return "Temperature 0-2.";
  if (!(cfg.maxTokens >= 256 && cfg.maxTokens <= 16384)) return "MaxTokens 256-16384.";
  return null;
}

interface SettingsPanelProps {
  modelConfig: ModelConfig | null;
  evolutionConfig: EvolutionConfig;
  onModelConfigChange: (config: ModelConfig | null) => void;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
}

export default function SettingsPanel({
  modelConfig,
  evolutionConfig,
  onModelConfigChange,
  onEvolutionConfigChange,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [localModelConfig, setLocalModelConfig] = useState<ModelConfig>(
    () => modelConfig ?? {
      provider: "local",
      model: "local-heuristic",
      apiKey: "",
      baseUrl: "",
      temperature: 0.7,
      maxTokens: 2048,
    }
  );
  const [localEvoConfig, setLocalEvoConfig] = useState<EvolutionConfig>(evolutionConfig);
  const [error, setError] = useState<string | null>(null);

  const handleProviderChange = (providerId: ModelProviderId) => {
    const defaults = DEFAULT_MODEL_CONFIGS[providerId];
    setLocalModelConfig({
      ...defaults,
      provider: providerId,
      apiKey: localModelConfig.apiKey,
      baseUrl: defaults.baseUrl,
      model: PROVIDER_MODELS[providerId][0],
    });
  };

  const handleSave = () => {
    if (localModelConfig.provider === "local") {
      clearModelConfig();
      onModelConfigChange(null);
    } else {
      const err = validateModelConfig(localModelConfig);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      saveModelConfig({ ...localModelConfig, apiKey: localModelConfig.apiKey.trim() });
      onModelConfigChange({ ...localModelConfig, apiKey: localModelConfig.apiKey.trim() });
    }
    onEvolutionConfigChange(localEvoConfig);
    setOpen(false);
  };

  const handleClearKey = () => {
    clearModelConfig();
    setLocalModelConfig((prev) => ({ ...prev, apiKey: "" }));
    onModelConfigChange(null);
    setError(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-[#2d3436] bg-[#0d0f10] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[#2d3436] px-4 py-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[#8bd7ff]" />
              <span className="text-xs uppercase tracking-[0.22em] text-[#94a3b8]">Settings</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
            <div className="flex gap-2 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-3 text-[11px] leading-5 text-[#FCD34D]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>BYOK: tu key queda solo en tu navegador (localStorage). No la uses en equipos compartidos. Para prod compartida hace falta backend proxy.</span>
            </div>
            {/* MODEL PROVIDER */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white">
                <Brain className="h-3.5 w-3.5 text-[#8bd7ff]" />
                Model Provider
              </p>
              <select
                value={localModelConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value as ModelProviderId)}
                className="w-full rounded-xl border border-[#2d3436] bg-[#17191c] px-3 py-2 text-xs text-white"
              >
                <option value="local">Local (heuristic, no API key needed)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="openrouter">OpenRouter</option>
                <option value="ollama">Ollama (local)</option>
                <option value="zenmux">Zenmux</option>
              </select>
            </div>

            {localModelConfig.provider !== "local" && (
              <>
                <div>
                  <p className="mb-1 text-xs text-[#94a3b8]">Model</p>
                  <select
                    value={localModelConfig.model}
                    onChange={(e) => setLocalModelConfig({ ...localModelConfig, model: e.target.value })}
                    className="w-full rounded-xl border border-[#2d3436] bg-[#17191c] px-3 py-2 text-xs text-white"
                  >
                    {PROVIDER_MODELS[localModelConfig.provider]?.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-1 text-xs text-[#94a3b8]">API Key</p>
                  <input
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={localModelConfig.apiKey}
                    onChange={(e) => setLocalModelConfig({ ...localModelConfig, apiKey: e.target.value })}
                    placeholder={`${localModelConfig.provider} API key`}
                    className="w-full rounded-xl border border-[#2d3436] bg-[#17191c] px-3 py-2 text-xs text-white placeholder-[#64748b]"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs text-[#94a3b8]">Base URL</p>
                  <input
                    type="text"
                    value={localModelConfig.baseUrl}
                    onChange={(e) => setLocalModelConfig({ ...localModelConfig, baseUrl: e.target.value })}
                    className="w-full rounded-xl border border-[#2d3436] bg-[#17191c] px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-xs text-[#94a3b8]">Temperature</p>
                    <input
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={localModelConfig.temperature}
                      onChange={(e) => setLocalModelConfig({ ...localModelConfig, temperature: parseFloat(e.target.value) || 0.7 })}
                      className="w-full rounded-xl border border-[#2d3436] bg-[#17191c] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#94a3b8]">Max Tokens</p>
                    <input
                      type="number"
                      min={256}
                      max={16384}
                      step={256}
                      value={localModelConfig.maxTokens}
                      onChange={(e) => setLocalModelConfig({ ...localModelConfig, maxTokens: parseInt(e.target.value) || 2048 })}
                      className="w-full rounded-xl border border-[#2d3436] bg-[#17191c] px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* EVOLUTION PARAMS */}
            <div className="border-t border-[#2d3436] pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white">
                <Gauge className="h-3.5 w-3.5 text-[#00b894]" />
                Evolution Parameters
              </p>

              <div className="space-y-3">
                <SliderField
                  label="Rounds"
                  value={localEvoConfig.rounds}
                  min={1}
                  max={10}
                  onChange={(v) => setLocalEvoConfig({ ...localEvoConfig, rounds: v })}
                />
                <SliderField
                  label="Population"
                  value={localEvoConfig.populationSize}
                  min={2}
                  max={20}
                  onChange={(v) => setLocalEvoConfig({ ...localEvoConfig, populationSize: v })}
                />
                <SliderField
                  label="Mutation Rate"
                  value={Math.round(localEvoConfig.mutationRate * 100)}
                  min={5}
                  max={80}
                  suffix="%"
                  onChange={(v) => setLocalEvoConfig({ ...localEvoConfig, mutationRate: v / 100 })}
                />
                <SliderField
                  label="Elite Count"
                  value={localEvoConfig.eliteCount}
                  min={1}
                  max={5}
                  onChange={(v) => setLocalEvoConfig({ ...localEvoConfig, eliteCount: v })}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#2d3436] px-4 py-3 space-y-2">
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleSave}
              className="foundry-button flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
            {localModelConfig.provider !== "local" && (
              <button
                onClick={handleClearKey}
                className="foundry-button-secondary flex w-full items-center justify-center gap-2 px-4 py-2 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Borrar key local
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`rounded-full border p-3 shadow-lg backdrop-blur transition ${
          modelConfig && modelConfig.provider !== "local"
            ? "border-[#8bd7ff]/60 bg-[#082f49]/60 text-[#bae6fd]"
            : "border-[#2d3436] bg-[#0d0f10]/80 text-[#94a3b8]"
        } hover:border-[#8bd7ff] hover:text-white`}
      >
        <Settings2 className="h-5 w-5" />
      </button>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-[#94a3b8]">{label}</span>
        <span className="font-mono text-white">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#6c5ce7]"
      />
    </div>
  );
}
