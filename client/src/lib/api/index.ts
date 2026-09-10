import type { ApiClient } from "./client";
import { MockApiClient } from "./mockClient";

export const api: ApiClient = new MockApiClient();

export * from "./client";
export * from "./types";
