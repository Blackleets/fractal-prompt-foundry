import { BaseModelProvider } from "./provider";
import type { ModelMessage, ModelResponse } from "./types";

export class OpenAIProvider extends BaseModelProvider {
  async chat(messages: ModelMessage[], system?: string): Promise<ModelResponse> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: system
        ? [{ role: "system", content: system }, ...messages]
        : messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };

    const response = await this.fetchJson(`${this.config.baseUrl}/chat/completions`, body, {
      Authorization: `Bearer ${this.config.apiKey}`,
    });

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? "",
      model: data.model ?? this.config.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async chatJson<T>(messages: ModelMessage[], system?: string): Promise<T> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: system
        ? [{ role: "system", content: system }, ...messages]
        : messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      response_format: { type: "json_object" },
    };

    const response = await this.fetchJson(`${this.config.baseUrl}/chat/completions`, body, {
      Authorization: `Bearer ${this.config.apiKey}`,
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error(`Failed to parse JSON response: ${content.slice(0, 200)}`);
    }
  }
}
