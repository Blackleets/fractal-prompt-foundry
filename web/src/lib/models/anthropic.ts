import { BaseModelProvider } from "./provider";
import type { ModelMessage, ModelResponse } from "./types";

export class AnthropicProvider extends BaseModelProvider {
  async chat(messages: ModelMessage[], system?: string): Promise<ModelResponse> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: this.config.temperature,
    };

    if (system) {
      body.system = system;
    }

    const response = await this.fetchJson(`${this.config.baseUrl}/messages`, body, {
      "x-api-key": this.config.apiKey,
      "anthropic-version": "2023-06-01",
    });

    const data = await response.json();
    const content = data.content
      ?.map((block: { type: string; text: string }) => block.type === "text" ? block.text : "")
      .join("") ?? "";

    return {
      content,
      model: data.model ?? this.config.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
          }
        : undefined,
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
