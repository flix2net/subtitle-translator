// Translation service configuration

import type { TranslationServiceInfo } from "./types";

export const DEFAULT_SYS_PROMPT = "You are a professional translator. Respond only with the content, either translated or rewritten. Do not add explanations, comments, or any extra text.";
export const DEFAULT_USER_PROMPT = "Please respect the original meaning, maintain the original format, and rewrite the following content in ${targetLanguage}.\n\n${content}";

export const TRANSLATION_SERVICES: TranslationServiceInfo[] = [
  { value: "gtxFreeAPI", label: "GTX API (Free)", tier: "free", recommended: true },
  {
    value: "google",
    label: "Google Translate",
    docs: "https://docs.cloud.google.com/translate/docs/setup",
    tier: "paid",
  },
  {
    value: "deepl",
    label: "DeepL",
    docs: "https://developers.deepl.com/docs/api-reference/translate",
    apiKeyUrl: "https://www.deepl.com/your-account/keys",
    tier: "paid",
    recommended: true,
  },
  {
    value: "qwenMt",
    label: "Qwen-MT",
    docs: "https://help.aliyun.com/zh/model-studio/machine-translation",
    apiKeyUrl: "https://bailian.console.aliyun.com/?apiKey=1",
    tier: "paid",
  },
  {
    value: "azure",
    label: "Azure Translate",
    docs: "https://learn.microsoft.com/azure/ai-services/translator/text-translation/reference/v3/translate",
    tier: "paid",
  },
  {
    value: "deeplx",
    label: "DeepLX (Free)",
    docs: "https://deeplx.owo.network/endpoints/free.html",
    tier: "free",
  },
  {
    value: "libretranslate",
    label: "LibreTranslate (Free)",
    docs: "https://libretranslate.com/docs",
    tier: "free",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    docs: "https://api-docs.deepseek.com/zh-cn/",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    tier: "paid",
    recommended: true,
  },
  {
    value: "claude",
    label: "Claude",
    docs: "https://docs.anthropic.com/en/api/messages",
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    tier: "paid",
  },
  {
    value: "openai",
    label: "OpenAI",
    docs: "https://platform.openai.com/docs/api-reference/chat",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    tier: "paid",
  },
  {
    value: "gemini",
    label: "Gemini",
    docs: "https://ai.google.dev/gemini-api/docs/text-generation",
    apiKeyUrl: "https://aistudio.google.com/app/api-keys",
    tier: "paid",
    recommended: true,
  },
  {
    value: "perplexity",
    label: "Perplexity",
    docs: "https://docs.perplexity.ai/api-reference/chat-completions-post",
    apiKeyUrl: "https://www.perplexity.ai/account/api/keys",
    tier: "paid",
  },
  {
    value: "azureopenai",
    label: "Azure OpenAI",
    docs: "https://learn.microsoft.com/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure",
    tier: "paid",
  },
  {
    value: "siliconflow",
    label: "SiliconFlow",
    docs: "https://docs.siliconflow.cn/api-reference/chat-completions/chat-completions",
    apiKeyUrl: "https://cloud.siliconflow.cn/me/account/ak",
    tier: "paid",
  },
  {
    value: "groq",
    label: "Groq",
    docs: "https://console.groq.com/docs/text-chat",
    apiKeyUrl: "https://console.groq.com/keys",
    tier: "paid",
    recommended: true,
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    docs: "https://openrouter.ai/models?q=free",
    apiKeyUrl: "https://openrouter.ai/settings/keys",
    tier: "paid",
  },
  {
    value: "nvidia",
    label: "Nvidia NIM",
    docs: "https://build.nvidia.com/explore/discover",
    apiKeyUrl: "https://build.nvidia.com/",
    tier: "paid",
    recommended: true,
  },
  {
    value: "mistral",
    label: "Mistral AI",
    docs: "https://docs.mistral.ai/api/",
    apiKeyUrl: "https://console.mistral.ai/api-keys/",
    tier: "paid",
  },
  {
    value: "cohere",
    label: "Cohere",
    docs: "https://docs.cohere.com/reference/chat",
    apiKeyUrl: "https://dashboard.cohere.com/api-keys",
    tier: "paid",
  },
  {
    value: "xai",
    label: "xAI Grok",
    docs: "https://docs.x.ai/api/endpoints",
    apiKeyUrl: "https://console.x.ai/",
    tier: "paid",
  },
  { value: "llm", label: "Custom LLM", tier: "custom" },
];

export const LLM_MODELS = ["deepseek", "claude", "openai", "gemini", "perplexity", "azureopenai", "siliconflow", "groq", "openrouter", "nvidia", "mistral", "cohere", "xai", "llm"];

export const categorizedOptions = [
  ...TRANSLATION_SERVICES.filter((s) => !LLM_MODELS.includes(s.value)).map((s) => ({
    label: `${s.label}${s.recommended ? " ⭐" : ""}${s.tier === "free" ? " (Free)" : ""}`,
    value: s.value,
  })),
  {
    label: "AI LLM Models",
    options: TRANSLATION_SERVICES.filter((s) => LLM_MODELS.includes(s.value)).map((s) => ({
      label: `${s.label}${s.recommended ? " ⭐" : ""}`,
      value: s.value,
    })),
  },
];

export const defaultConfigs = {
  gtxFreeAPI: {
    batchSize: 100,
  },
  deeplx: {
    url: "",
    chunkSize: 1000,
    delayTime: 200,
    batchSize: 10,
  },
  deepl: {
    url: "",
    apiKey: "",
    chunkSize: 5000,
    delayTime: 200,
    batchSize: 20,
  },
  qwenMt: {
    url: "",
    apiKey: "",
    domains: "",
    model: "qwen-mt-flash",
    batchSize: 20,
  },
  deepseek: {
    apiKey: "",
    model: "deepseek-chat",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
    useRelay: false,
  },
  claude: {
    apiKey: "",
    model: "claude-sonnet-4-6",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
    enableThinking: false,
  },
  openai: {
    apiKey: "",
    model: "gpt-5.4-mini",
    temperature: 1,
    batchSize: 20,
    contextWindow: 50,
  },
  gemini: {
    apiKey: "",
    model: "gemini-2.5-flash",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  perplexity: {
    apiKey: "",
    model: "sonar",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  azureopenai: {
    url: "",
    apiKey: "",
    model: "gpt-5-mini",
    apiVersion: "2025-08-07",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  siliconflow: {
    apiKey: "",
    model: "deepseek-ai/DeepSeek-V3",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  groq: {
    apiKey: "",
    model: "openai/gpt-oss-20b",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  openrouter: {
    apiKey: "",
    model: "nvidia/nemotron-3-super-120b-a12b:free",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: process.env.NEXT_PUBLIC_NVIDIA_API_KEY || "",
    model: "qwen/qwen3-next-80b-a3b-instruct",
    temperature: 0.3,
    batchSize: 20,
    contextWindow: 50,
    enableThinking: false,
  },
  mistral: {
    apiKey: "",
    model: "mistral-large-latest",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  cohere: {
    apiKey: "",
    model: "command-r-plus",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  xai: {
    apiKey: "",
    model: "grok-3-latest",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  libretranslate: {
    url: "http://127.0.0.1:5000",
    apiKey: "",
    batchSize: 50,
  },
  llm: {
    url: "http://127.0.0.1:11434/v1/chat/completions",
    apiKey: "",
    model: "llama3.2",
    temperature: 0.7,
    batchSize: 20,
    contextWindow: 50,
  },
  azure: {
    apiKey: "",
    chunkSize: 10000,
    delayTime: 200,
    region: "eastasia",
    batchSize: 100,
  },
  google: {
    apiKey: "",
    delayTime: 200,
    batchSize: 100,
  },
  webgoogletranslate: {
    batchSize: 1,
  },
} as const;

export const findMethodLabel = (method: string): string => {
  const service = TRANSLATION_SERVICES.find((s) => s.value === method);
  return service ? service.label : method;
};

export const isConfigStructureValid = (config: Record<string, unknown>, defaultConfig: Record<string, unknown>): boolean => {
  const configKeys = Object.keys(config).sort();
  const defaultKeys = Object.keys(defaultConfig).sort();
  return JSON.stringify(configKeys) === JSON.stringify(defaultKeys);
};
