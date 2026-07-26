/**
 * OpenAI-compatible provider configurations.
 * Each provider uses the same chat protocol as OpenAI; only the base URL,
 * API key env var, and model catalog differ.
 */

import { OpenAIAdapter } from "./openai";
import type { AIProviderAdapter } from "./types";

export interface OpenAICompatProvider {
  id: string;
  displayName: string;
  apiBaseUrl: string;
  websiteUrl: string;
  envKeyName: string;
  models: Array<{
    providerModelId: string;
    displayName: string;
    family?: string;
    contextWindow: number;
    maxOutputTokens: number;
    supportsVision?: boolean;
    supportsReasoning?: boolean;
    supportsTools?: boolean;
    supportsWebSearch?: boolean;
    inputModalities?: Array<"text" | "image" | "audio" | "video" | "pdf">;
    priceInputMicrosPer1M: number;
    priceOutputMicrosPer1M: number;
    qualityScore?: number;
    speedScore?: number;
    costScore?: number;
    recommendedFor?: string[];
  }>;
}

export const OPENAI_COMPAT_PROVIDERS: OpenAICompatProvider[] = [
  // xAI — Grok models
  {
    id: "xai",
    displayName: "xAI (Grok)",
    apiBaseUrl: "https://api.x.ai/v1",
    websiteUrl: "https://x.ai",
    envKeyName: "XAI_API_KEY",
    models: [
      {
        providerModelId: "grok-2-vision-1212",
        displayName: "Grok 2 Vision",
        family: "grok-2",
        contextWindow: 32_000,
        maxOutputTokens: 8_192,
        supportsVision: true,
        supportsTools: true,
        inputModalities: ["text", "image"],
        priceInputMicrosPer1M: 2_000_000,
        priceOutputMicrosPer1M: 10_000_000,
        qualityScore: 88,
        speedScore: 80,
        costScore: 65,
        recommendedFor: ["chat", "vision", "tools"],
      },
      {
        providerModelId: "grok-2-1212",
        displayName: "Grok 2",
        family: "grok-2",
        contextWindow: 131_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 2_000_000,
        priceOutputMicrosPer1M: 10_000_000,
        qualityScore: 88,
        speedScore: 80,
        costScore: 65,
        recommendedFor: ["chat", "code", "tools", "writing"],
      },
      {
        providerModelId: "grok-beta",
        displayName: "Grok Beta",
        family: "grok",
        contextWindow: 131_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 5_000_000,
        priceOutputMicrosPer1M: 15_000_000,
        qualityScore: 85,
        speedScore: 75,
        costScore: 60,
        recommendedFor: ["chat", "reasoning"],
      },
    ],
  },

  // DeepSeek
  {
    id: "deepseek",
    displayName: "DeepSeek",
    apiBaseUrl: "https://api.deepseek.com",
    websiteUrl: "https://deepseek.com",
    envKeyName: "DEEPSEEK_API_KEY",
    models: [
      {
        providerModelId: "deepseek-chat",
        displayName: "DeepSeek V3 Chat",
        family: "deepseek-v3",
        contextWindow: 64_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 140_000,
        priceOutputMicrosPer1M: 280_000,
        qualityScore: 90,
        speedScore: 75,
        costScore: 95,
        recommendedFor: ["chat", "code", "reasoning", "tools"],
      },
      {
        providerModelId: "deepseek-reasoner",
        displayName: "DeepSeek R1 Reasoner",
        family: "deepseek-r1",
        contextWindow: 64_000,
        maxOutputTokens: 8_192,
        supportsReasoning: true,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 550_000,
        priceOutputMicrosPer1M: 2_190_000,
        qualityScore: 95,
        speedScore: 50,
        costScore: 75,
        recommendedFor: ["reasoning", "code", "math"],
      },
    ],
  },

  // Moonshot — Kimi
  {
    id: "moonshot",
    displayName: "Moonshot (Kimi)",
    apiBaseUrl: "https://api.moonshot.cn/v1",
    websiteUrl: "https://www.moonshot.ai",
    envKeyName: "MOONSHOT_API_KEY",
    models: [
      {
        providerModelId: "moonshot-v1-128k",
        displayName: "Kimi K2 128K",
        family: "moonshot-v1",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 200_000,
        priceOutputMicrosPer1M: 200_000,
        qualityScore: 82,
        speedScore: 75,
        costScore: 90,
        recommendedFor: ["chat", "long_context", "code", "tools"],
      },
      {
        providerModelId: "moonshot-v1-32k-vision-preview",
        displayName: "Kimi 32K Vision (Preview)",
        family: "moonshot-v1",
        contextWindow: 32_000,
        maxOutputTokens: 8_192,
        supportsVision: true,
        inputModalities: ["text", "image"],
        priceInputMicrosPer1M: 200_000,
        priceOutputMicrosPer1M: 200_000,
        qualityScore: 80,
        speedScore: 70,
        costScore: 88,
        recommendedFor: ["vision", "chat"],
      },
    ],
  },

  // Mistral
  {
    id: "mistral",
    displayName: "Mistral AI",
    apiBaseUrl: "https://api.mistral.ai/v1",
    websiteUrl: "https://mistral.ai",
    envKeyName: "MISTRAL_API_KEY",
    models: [
      {
        providerModelId: "mistral-large-latest",
        displayName: "Mistral Large 2",
        family: "mistral-large",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 2_000_000,
        priceOutputMicrosPer1M: 6_000_000,
        qualityScore: 88,
        speedScore: 70,
        costScore: 65,
        recommendedFor: ["chat", "code", "reasoning", "tools"],
      },
      {
        providerModelId: "mistral-small-latest",
        displayName: "Mistral Small",
        family: "mistral-small",
        contextWindow: 32_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 200_000,
        priceOutputMicrosPer1M: 600_000,
        qualityScore: 75,
        speedScore: 90,
        costScore: 90,
        recommendedFor: ["chat", "tools"],
      },
    ],
  },

  // Cohere
  {
    id: "cohere",
    displayName: "Cohere",
    apiBaseUrl: "https://api.cohere.com/v1",
    websiteUrl: "https://cohere.com",
    envKeyName: "COHERE_API_KEY",
    models: [
      {
        providerModelId: "command-r-plus",
        displayName: "Command R+",
        family: "command-r",
        contextWindow: 128_000,
        maxOutputTokens: 4_000,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 2_500_000,
        priceOutputMicrosPer1M: 10_000_000,
        qualityScore: 86,
        speedScore: 70,
        costScore: 60,
        recommendedFor: ["chat", "tools", "writing"],
      },
      {
        providerModelId: "command-r",
        displayName: "Command R",
        family: "command-r",
        contextWindow: 128_000,
        maxOutputTokens: 4_000,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 500_000,
        priceOutputMicrosPer1M: 1_500_000,
        qualityScore: 78,
        speedScore: 85,
        costScore: 85,
        recommendedFor: ["chat", "tools"],
      },
    ],
  },

  // Perplexity
  {
    id: "perplexity",
    displayName: "Perplexity",
    apiBaseUrl: "https://api.perplexity.ai",
    websiteUrl: "https://perplexity.ai",
    envKeyName: "PERPLEXITY_API_KEY",
    models: [
      {
        providerModelId: "llama-3.1-sonar-large-128k-online",
        displayName: "Sonar Large (Online)",
        family: "sonar",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        supportsWebSearch: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 1_000_000,
        priceOutputMicrosPer1M: 1_000_000,
        qualityScore: 88,
        speedScore: 70,
        costScore: 80,
        recommendedFor: ["research", "web_search"],
      },
      {
        providerModelId: "llama-3.1-sonar-small-128k-online",
        displayName: "Sonar Small (Online)",
        family: "sonar",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        supportsWebSearch: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 200_000,
        priceOutputMicrosPer1M: 200_000,
        qualityScore: 78,
        speedScore: 85,
        costScore: 95,
        recommendedFor: ["research", "web_search"],
      },
    ],
  },

  // Groq — fast inference for OSS models
  {
    id: "groq",
    displayName: "Groq",
    apiBaseUrl: "https://api.groq.com/openai/v1",
    websiteUrl: "https://groq.com",
    envKeyName: "GROQ_API_KEY",
    models: [
      {
        providerModelId: "llama-3.3-70b-versatile",
        displayName: "Llama 3.3 70B Versatile",
        family: "llama-3.3",
        contextWindow: 128_000,
        maxOutputTokens: 32_768,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 590_000,
        priceOutputMicrosPer1M: 790_000,
        qualityScore: 88,
        speedScore: 100,
        costScore: 85,
        recommendedFor: ["chat", "code", "tools"],
      },
      {
        providerModelId: "llama-3.1-8b-instant",
        displayName: "Llama 3.1 8B Instant",
        family: "llama-3.1",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 50_000,
        priceOutputMicrosPer1M: 80_000,
        qualityScore: 70,
        speedScore: 100,
        costScore: 100,
        recommendedFor: ["chat", "tools"],
      },
      {
        providerModelId: "mixtral-8x7b-32768",
        displayName: "Mixtral 8x7B",
        family: "mixtral",
        contextWindow: 32_000,
        maxOutputTokens: 8_192,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 240_000,
        priceOutputMicrosPer1M: 240_000,
        qualityScore: 75,
        speedScore: 100,
        costScore: 90,
        recommendedFor: ["chat"],
      },
    ],
  },

  // Together AI
  {
    id: "together",
    displayName: "Together AI",
    apiBaseUrl: "https://api.together.xyz/v1",
    websiteUrl: "https://together.ai",
    envKeyName: "TOGETHER_API_KEY",
    models: [
      {
        providerModelId: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        displayName: "Llama 3.1 405B Turbo",
        family: "llama-3.1",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 3_500_000,
        priceOutputMicrosPer1M: 3_500_000,
        qualityScore: 92,
        speedScore: 60,
        costScore: 55,
        recommendedFor: ["chat", "code", "reasoning"],
      },
      {
        providerModelId: "Qwen/Qwen2.5-72B-Instruct-Turbo",
        displayName: "Qwen 2.5 72B Turbo",
        family: "qwen-2.5",
        contextWindow: 32_000,
        maxOutputTokens: 8_192,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 1_200_000,
        priceOutputMicrosPer1M: 1_200_000,
        qualityScore: 86,
        speedScore: 80,
        costScore: 75,
        recommendedFor: ["chat", "code", "multilingual"],
      },
    ],
  },

  // Fireworks
  {
    id: "fireworks",
    displayName: "Fireworks",
    apiBaseUrl: "https://api.fireworks.ai/inference/v1",
    websiteUrl: "https://fireworks.ai",
    envKeyName: "FIREWORKS_API_KEY",
    models: [
      {
        providerModelId: "accounts/fireworks/models/llama-v3p3-70b-instruct",
        displayName: "Llama 3.3 70B",
        family: "llama-3.3",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 900_000,
        priceOutputMicrosPer1M: 900_000,
        qualityScore: 88,
        speedScore: 95,
        costScore: 80,
        recommendedFor: ["chat", "code"],
      },
      {
        providerModelId: "accounts/fireworks/models/deepseek-r1",
        displayName: "DeepSeek R1",
        family: "deepseek-r1",
        contextWindow: 164_000,
        maxOutputTokens: 8_192,
        supportsReasoning: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 3_000_000,
        priceOutputMicrosPer1M: 8_000_000,
        qualityScore: 94,
        speedScore: 60,
        costScore: 70,
        recommendedFor: ["reasoning", "code", "math"],
      },
    ],
  },

  // Qwen (Alibaba) — direct or via DashScope
  {
    id: "qwen",
    displayName: "Qwen (Alibaba)",
    apiBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    websiteUrl: "https://qwen.alibaba.com",
    envKeyName: "QWEN_API_KEY",
    models: [
      {
        providerModelId: "qwen-max",
        displayName: "Qwen Max",
        family: "qwen-max",
        contextWindow: 32_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 2_000_000,
        priceOutputMicrosPer1M: 6_000_000,
        qualityScore: 88,
        speedScore: 70,
        costScore: 65,
        recommendedFor: ["chat", "code", "multilingual", "tools"],
      },
      {
        providerModelId: "qwen-plus",
        displayName: "Qwen Plus",
        family: "qwen-plus",
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        supportsTools: true,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 400_000,
        priceOutputMicrosPer1M: 1_200_000,
        qualityScore: 82,
        speedScore: 85,
        costScore: 85,
        recommendedFor: ["chat", "tools", "long_context"],
      },
      {
        providerModelId: "qwen-turbo",
        displayName: "Qwen Turbo",
        family: "qwen-turbo",
        contextWindow: 1_000_000,
        maxOutputTokens: 8_192,
        inputModalities: ["text"],
        priceInputMicrosPer1M: 50_000,
        priceOutputMicrosPer1M: 100_000,
        qualityScore: 70,
        speedScore: 100,
        costScore: 100,
        recommendedFor: ["chat", "long_context"],
      },
    ],
  },
];

/**
 * Returns a live OpenAIAdapter for the given OpenAI-compat provider id,
 * or null if the provider has its own native adapter.
 */
export function openAICompatAdapterFor(providerId: string): AIProviderAdapter | null {
  const config = OPENAI_COMPAT_PROVIDERS.find((p) => p.id === providerId);
  if (!config) return null;
  return new OpenAIAdapter(config.apiBaseUrl);
}
