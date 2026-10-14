import { BaseModelProvider } from "./provider";
import type { ModelMessage, ModelResponse } from "./types";

export class OllamaProvider extends BaseModelProvider {
  async chat(messages: ModelMessage[], system?: string): Promise<ModelResponse> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: system
        ? [{ role: "system", content: system }, ...messages]
        : messages,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
      stream: false,
    };

    const response = await this.fetchJson(`${this.config.baseUrl}/api/chat`, body);
    const data = await response.json();

    return {
      content: data.message?.content ?? "",
      model: data.model ?? this.config.model,
    };
  }

  async chatJson<T>(messages: ModelMessage[], system?: string): Promise<T> {
    const result = await this.chat([
      ...messages,
      { role: "user", content: "Respond with valid JSON only. No markdown, no explanation." },
    ], system);

    const cleaned = result.content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/g, "")
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(`Failed to parse JSON response: ${cleaned.slice(0, 200)}`);
    }
  }
}
