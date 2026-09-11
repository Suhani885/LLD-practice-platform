import type { FeedbackProvider } from "../FeedbackProvider";
import { GroqProvider } from "./GroqProvider";
import { MockProvider } from "./MockProvider";

export function createFeedbackProvider(apiKey: string, model: string): FeedbackProvider {
  return apiKey ? new GroqProvider(apiKey, model) : new MockProvider();
}

export { GroqProvider, MockProvider };
