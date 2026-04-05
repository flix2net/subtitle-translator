"use client";

import { Form, Select, Input, Space, Tooltip, Tag } from "antd";
import { categorizedOptions, findMethodLabel, type TranslationConfig } from "@/app/lib/translation";
import { useTranslations } from "next-intl";

// Services that support custom URL endpoint
const URL_SUPPORTED_SERVICES = ["nvidia", "libretranslate", "llm", "deeplx", "deepl", "qwenMt", "azureopenai"];

// Model presets for popular LLM providers
const MODEL_PRESETS: Record<string, { label: string; value: string }[]> = {
  nvidia: [
    { label: "meta/llama-3.3-70b-instruct", value: "meta/llama-3.3-70b-instruct" },
    { label: "meta/llama-3.1-405b-instruct", value: "meta/llama-3.1-405b-instruct" },
    { label: "mistralai/mistral-large-2411", value: "mistralai/mistral-large-2411" },
    { label: "deepseek-ai/deepseek-v3.2", value: "deepseek-ai/deepseek-v3.2" },
    { label: "google/gemma-2b", value: "google/gemma-2b" },
  ],
  mistral: [
    { label: "mistral-large-latest", value: "mistral-large-latest" },
    { label: "mistral-small-latest", value: "mistral-small-latest" },
    { label: "codestral-latest", value: "codestral-latest" },
    { label: "ministral-8b-latest", value: "ministral-8b-latest" },
  ],
  openai: [
    { label: "gpt-5.4-mini", value: "gpt-5.4-mini" },
    { label: "gpt-5-mini", value: "gpt-5-mini" },
    { label: "gpt-4o", value: "gpt-4o" },
    { label: "o4-mini", value: "o4-mini" },
  ],
  deepseek: [
    { label: "deepseek-chat", value: "deepseek-chat" },
    { label: "deepseek-reasoner", value: "deepseek-reasoner" },
  ],
  gemini: [
    { label: "gemini-2.5-flash", value: "gemini-2.5-flash" },
    { label: "gemini-2.5-pro", value: "gemini-2.5-pro" },
    { label: "gemini-2.0-flash", value: "gemini-2.0-flash" },
  ],
  claude: [
    { label: "claude-sonnet-4-6", value: "claude-sonnet-4-6" },
    { label: "claude-opus-4-1", value: "claude-opus-4-1" },
    { label: "claude-3-5-sonnet-20241022", value: "claude-3-5-sonnet-20241022" },
  ],
  xai: [
    { label: "grok-3-latest", value: "grok-3-latest" },
    { label: "grok-3-fast-latest", value: "grok-3-fast-latest" },
    { label: "grok-3-mini-latest", value: "grok-3-mini-latest" },
  ],
  cohere: [
    { label: "command-r-plus", value: "command-r-plus" },
    { label: "command-r-plus-08-2024", value: "command-r-plus-08-2024" },
    { label: "command-r-08-2024", value: "command-r-08-2024" },
  ],
};

interface TranslationAPISelectorProps {
  translationMethod: string;
  setTranslationMethod: (value: string) => void;
  config: TranslationConfig | undefined;
  handleConfigChange: (method: string, key: string, value: string | number | boolean) => void;
}

/**
 * Shared component for selecting translation API and entering API key.
 * Used in SubtitleTranslator, MDTranslator, and JSONTranslator.
 */
const TranslationAPISelector = ({ translationMethod, setTranslationMethod, config, handleConfigChange }: TranslationAPISelectorProps) => {
  const t = useTranslations("common");
  const methodLabel = findMethodLabel(translationMethod);

  const modelPresets = MODEL_PRESETS[translationMethod];

  return (
    <Form.Item label={t("translationAPI")} className="!mt-2">
      <Space.Compact className="w-full">
        <Select showSearch value={translationMethod} onChange={(e) => setTranslationMethod(e)} options={categorizedOptions} className="w-[40%]" aria-label={t("translationAPI")} />
        {config?.apiKey !== undefined && translationMethod !== "llm" && (
          <Tooltip title={`${t("enter")} ${methodLabel} API Key`}>
            <Input.Password
              autoComplete="off"
              placeholder={`API Key`}
              value={config.apiKey as string | undefined}
              onChange={(e) => handleConfigChange(translationMethod, "apiKey", e.target.value)}
              className="w-[60%]"
              aria-label={`${methodLabel} API Key`}
            />
          </Tooltip>
        )}
      </Space.Compact>

      {/* URL endpoint for services that support it */}
      {config?.url !== undefined && URL_SUPPORTED_SERVICES.includes(translationMethod) && (
        <Form.Item className="!mt-2" label={<span className="text-xs">{t("apiEndpoint") || "API Endpoint"}</span>}>
          <Input
            placeholder="https://api.example.com/v1/chat/completions"
            value={config.url as string | undefined}
            onChange={(e) => handleConfigChange(translationMethod, "url", e.target.value)}
            aria-label={`${methodLabel} API Endpoint`}
          />
        </Form.Item>
      )}

      {/* Model selector with presets */}
      {config?.model !== undefined && (
        <Form.Item className="!mt-2" label={<span className="text-xs">{t("model") || "Model"}</span>}>
          <Space direction="vertical" size={4} className="w-full">
            {modelPresets && (
              <Space wrap>
                {modelPresets.map((preset) => (
                  <Tag
                    key={preset.value}
                    className="cursor-pointer select-none"
                    color={(config.model as string) === preset.value ? "blue" : "default"}
                    onClick={() => handleConfigChange(translationMethod, "model", preset.value)}>
                    {preset.label}
                  </Tag>
                ))}
              </Space>
            )}
            <Input
              placeholder={`Model name (default: ${modelPresets?.[0]?.label || "auto"})`}
              value={config.model as string | undefined}
              onChange={(e) => handleConfigChange(translationMethod, "model", e.target.value)}
              aria-label={`${methodLabel} Model`}
            />
          </Space>
        </Form.Item>
      )}
    </Form.Item>
  );
};

export default TranslationAPISelector;
