import type { ApiClient } from "./client";
import { HttpApiClient } from "./httpClient";

export const api: ApiClient = new HttpApiClient();

export * from "./client";
export * from "./types";
