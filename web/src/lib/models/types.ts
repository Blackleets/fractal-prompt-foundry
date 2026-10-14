export type ModelProviderId = "openai" | "anthropic" | "openrouter" | "ollama" | "local" | "zenmux";

export interface ModelConfig {
  provider: ModelProviderId;
  model: string;
  apiKey: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
}

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProviderCapabilities {
  chat: boolean;
  jsonMode: boolean;
  streaming: boolean;
}

export const DEFAULT_MODEL_CONFIGS: Record<ModelProviderId, Omit<ModelConfig, "apiKey">> = {
  openai: {
    provider: "openai",
    model: "gpt-4o",
    baseUrl: "https://api.openai.com/v1",
    temperature: 0.7,
    maxTokens: 2048,
  },
  anthropic: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    baseUrl: "https://api.anthropic.com/v1",
    temperature: 0.7,
    maxTokens: 2048,
  },
  openrouter: {
    provider: "openrouter",
    model: "openai/gpt-4o",
    baseUrl: "https://openrouter.ai/api/v1",
    temperature: 0.7,
    maxTokens: 2048,
  },
  ollama: {
    provider: "ollama",
    model: "llama3.2",
    baseUrl: "http://localhost:11434",
    temperature: 0.7,
    maxTokens: 2048,
  },
  local: {
    provider: "local",
    model: "local-heuristic",
    baseUrl: "",
    temperature: 0.7,
    maxTokens: 2048,
  },
  zenmux: {
    provider: "zenmux",
    model: "glm-5.2-free",
    baseUrl: "https://zenmux.ai/api/v1",
    temperature: 0.7,
    maxTokens: 4096,
  },
};

export const PROVIDER_MODELS: Record<ModelProviderId, string[]> = {
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
    "o1",
    "o3-mini",
  ],
  anthropic: [
    "claude-sonnet-4-20250514",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
  ],
  openrouter: [
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "anthropic/claude-sonnet-4-20250514",
    "anthropic/claude-3.5-sonnet",
    "google/gemini-2.0-flash-001",
    "meta-llama/llama-3.2-90b-vision",
    "deepseek/deepseek-chat",
  ],
  ollama: [
    "llama3.2",
    "llama3.1",
    "mistral",
    "mixtral",
    "codellama",
    "phi3",
    "gemma2",
  ],
  local: ["local-heuristic"],
  zenmux: [
    "glm-5.2-free",
    "z-ai/glm-5.2-free",
    "glm-5.2",
    "z-ai/glm-5.2",
  ],
};

export const MODEL_CONFIG_KEY = "fractal-foundry-model-config";
