import type { ModelConfig, ModelMessage, ModelResponse } from "./types";

export abstract class BaseModelProvider {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract chat(messages: ModelMessage[], system?: string): Promise<ModelResponse>;

  abstract chatJson<T>(messages: ModelMessage[], system?: string): Promise<T>;

  protected async fetchJson(url: string, body: Record<string, unknown>, headers: Record<string, string> = {}): Promise<Response> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error");
      throw new Error(`API error ${response.status}: ${text.slice(0, 500)}`);
    }

    return response;
  }
}
