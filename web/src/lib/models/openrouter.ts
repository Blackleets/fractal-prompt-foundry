import { OpenAIProvider } from "./openai";
import type { ModelConfig } from "./types";

export class OpenRouterProvider extends OpenAIProvider {
  constructor(config: ModelConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || "https://openrouter.ai/api/v1",
    });
  }

  protected async fetchJson(url: string, body: Record<string, unknown>, headers: Record<string, string> = {}): Promise<Response> {
    return super.fetchJson(url, body, {
      ...headers,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://fractal-prompt-foundry.local",
      "X-Title": "Fractal Prompt Foundry",
    });
  }
}
