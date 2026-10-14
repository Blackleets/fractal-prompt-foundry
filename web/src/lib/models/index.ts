import { AnthropicProvider } from "./anthropic";
import { OllamaProvider } from "./ollama";
import { OpenAIProvider } from "./openai";
import { OpenRouterProvider } from "./openrouter";
import { ZenmuxProvider } from "./zenmux";
import { BaseModelProvider } from "./provider";
import { MODEL_CONFIG_KEY, type ModelConfig, type ModelProviderId } from "./types";

const providerConstructors: Record<ModelProviderId, new (config: ModelConfig) => BaseModelProvider> = {
  openai: OpenAIProvider,
  anthropic: AnthropicProvider,
  openrouter: OpenRouterProvider,
  ollama: OllamaProvider,
  local: OpenAIProvider,
  zenmux: ZenmuxProvider,
};

export function createModelProvider(config: ModelConfig): BaseModelProvider {
  if (config.provider === "local") {
    throw new Error("Local provider does not connect to any API. Use heuristic evaluation instead.");
  }
  const Constructor = providerConstructors[config.provider];
  if (!Constructor) {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
  return new Constructor(config);
}

export function loadModelConfig(): ModelConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MODEL_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ModelConfig;
  } catch {
    localStorage.removeItem(MODEL_CONFIG_KEY);
    return null;
  }
}

export function saveModelConfig(config: ModelConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODEL_CONFIG_KEY, JSON.stringify(config));
}

export function clearModelConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MODEL_CONFIG_KEY);
}

export { BaseModelProvider };
export type { ModelConfig, ModelMessage, ModelResponse, ModelProviderId } from "./types";
export { DEFAULT_MODEL_CONFIGS, PROVIDER_MODELS } from "./types";
