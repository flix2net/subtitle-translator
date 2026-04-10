# Subtitle Translator v2.3

A blazing-fast, AI-powered batch subtitle translation tool that supports `.srt`, `.ass`, `.vtt`, and `.lrc` formats. Fork of [rockbenben/subtitle-translator](https://github.com/rockbenben/subtitle-translator) with enhanced API support, glassmorphism UI, and powerful subtitle editing features.

**🚀 Live Demo**: [GitHub Pages](https://flix2net.github.io/subtitle-translator/) | **⚡ Quick Start**: One-click deploy to Vercel

## ✨ Key Features

- **Real-time translation** (~1 sec/episode) via chunked compression and parallel processing
- **Batch processing** for hundreds of subtitle files
- **50+ languages** with simultaneous multi-language translation
- **Context-aware AI translation** for natural dialogue
- **Bilingual output** with adjustable positioning
- **Glassmorphism UI** with animated gradient backgrounds

### 🤖 Translation APIs (15+ Services)

#### Free APIs
- **GTX API** - Google Translate free endpoint
- **DeepLX** - Community DeepL proxy
- **LibreTranslate** - Self-hosted open-source

#### Paid LLM Models
| Provider | Default Model | API Key | Best For |
|----------|--------------|---------|----------|
| **Nvidia NIM** ⭐ | `qwen/qwen3-next-80b-a3b-instruct` | [build.nvidia.com](https://build.nvidia.com/settings/api-keys) | **Subtitles, all languages** |
| **Nvidia NIM** ⭐ | `qwen/qwen3-next-80b-a3b-thinking` | [build.nvidia.com](https://build.nvidia.com/settings/api-keys) | **119 languages** |
| **Nvidia NIM** ⭐ | `qwen/qwen3.5-397b-a17b` | [build.nvidia.com](https://build.nvidia.com/settings/api-keys) | **Largest, most accurate** |
| **DeepSeek** ⭐ | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) | Fast, accurate |
| **OpenAI** | `gpt-5.4-mini` | [platform.openai.com](https://platform.openai.com/api-keys) | General purpose |
| **Gemini** ⭐ | `gemini-2.5-flash` | [aistudio.google.com](https://aistudio.google.com/app/api-keys) | Fast, free tier |
| **Claude** | `claude-sonnet-4-6` | [console.anthropic.com](https://console.anthropic.com/settings/keys) | High quality |
| **Mistral AI** | `mistral-large-latest` | [console.mistral.ai](https://console.mistral.ai/api-keys/) | European languages |
| **Cohere** | `command-r-plus` | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) | Enterprise |
| **xAI Grok** | `grok-3-latest` | [console.x.ai](https://console.x.ai/) | Real-time |
| **Groq** ⭐ | `openai/gpt-oss-20b` | [console.groq.com](https://console.groq.com/keys) | Ultra-fast |
| **Perplexity** | `sonar` | [perplexity.ai](https://www.perplexity.ai/account/api/keys) | Web-aware |
| **OpenRouter** | `nvidia/nemotron-3-super-120b-a12b:free` | [openrouter.ai](https://openrouter.ai/settings/keys) | Free access |
| **Azure OpenAI** | `gpt-5-mini` | Azure Portal | Enterprise |
| **SiliconFlow** | `deepseek-ai/DeepSeek-V3` | [cloud.siliconflow.cn](https://cloud.siliconflow.cn/me/account/ak) | China access |

⭐ = Recommended for subtitle translation quality

**Nvidia NIM Free Tier**: 5,000 free credits on signup (~500-1000 subtitle files). Qwen3-Next-80B costs ~$0.001 per 1K tokens.

### 🎨 UI/UX Enhancements

- **Glassmorphism theme** - Frosted glass cards, animated gradient backgrounds, smooth transitions
- **API badges** - Free ⭐, Recommended, and tier indicators
- **Model presets** - One-click selection for 12+ Nvidia NIM models including all Qwen variants
- **Custom endpoint support** - Configure any OpenAI-compatible endpoint
- **API key help links** - Direct links to get API keys for each provider
- **Improved dark mode** - Better contrast, glow effects, scrollbar styling

#### Nvidia NIM Available Models
| Model ID | Speed | Quality | Best For |
|---|---|---|---|
| **qwen/qwen3-next-80b-a3b-instruct** | ⚡⚡ Fast | ⭐⭐⭐⭐⭐ | **Subtitles, all languages** |
| **qwen/qwen3-next-80b-a3b-thinking** | ⚡⚡ Fast | ⭐⭐⭐⭐⭐ | **119 languages** |
| **qwen/qwen3.5-397b-a17b** | ⚡ Slower | ⭐⭐⭐⭐⭐ | Largest model, most accurate |
| qwen/qwen3.5-122b-a10b | ⚡⚡ Fast | ⭐⭐⭐⭐ | Good balance |
| qwen/qwen2.5-7b-instruct | ⚡⚡⚡ Very Fast | ⭐⭐⭐ | Quick translations |
| qwen/qwen2-7b-instruct | ⚡⚡⚡ Very Fast | ⭐⭐⭐ | Quick translations |
| google/gemma-3-27b-it | ⚡⚡ Fast | ⭐⭐⭐⭐ | Google quality |
| google/gemma-4-31b-it | ⚡⚡ Fast | ⭐⭐⭐⭐ | Latest Gemma |
| meta/llama-3.3-70b-instruct | ⚡⚡ Fast | ⭐⭐⭐⭐ | Meta quality |
| meta/llama-nemotron-super-120b-a12b | ⚡ Fast | ⭐⭐⭐⭐⭐ | Largest Meta |
| deepseek-ai/deepseek-v3.2 | ⚡⚡ Fast | ⭐⭐⭐⭐⭐ | DeepSeek quality |
| mistralai/mistral-large-2411 | ⚡⚡ Fast | ⭐⭐⭐⭐ | Mistral quality |

#### Subtitle Tools
- **Timestamp shifting** - Delay/advance all timestamps by ±N ms
- **Merge lines** - Combine short consecutive subtitles
- **Split lines** - Auto-split long subtitles at word boundaries
- **Glossary support** - Define custom terminology mappings
- **Translation history** - Browse recent translations in IndexedDB

## Quick Start

### Prerequisites

- Node.js >= 20.9.0
- Yarn or npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/flix2net/subtitle-translator.git
cd subtitle-translator

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
yarn build
yarn start
```

## Self-Hosting

### Docker Compose (Recommended)

```bash
# Start subtitle translator + optional LibreTranslate
docker-compose up -d

# View logs
docker-compose logs -f subtitle-translator

# Stop
docker-compose down
```

Access at `http://localhost:3000`.

### Docker Only

```bash
docker build -t subtitle-translator .
docker run -p 3000:3000 subtitle-translator
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fflix2net%2Fsubtitle-translator)

### GitHub Pages (Static Export)

```bash
# Build for static export
yarn build:lang

# Deploy to GitHub Pages
# The output is in the `out/` directory
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_USE_LOCAL_API` | Use local API routes (Docker) | `false` |
| `NEXT_PUBLIC_NVIDIA_API_KEY` | Pre-fill Nvidia API key (optional) | _empty_ |

### API Key Setup

All API keys can be entered directly in the app UI. They are stored in your browser's local storage and never sent to any server except the respective API provider.

For self-hosting, you can pre-fill the Nvidia API key via `NEXT_PUBLIC_NVIDIA_API_KEY` environment variable.

## CI/CD

This project uses GitHub Actions for automated testing and deployment:

- **On PR**: Lint check + build verification
- **On merge to main**: Docker image built and pushed to GHCR

```bash
# Manual Docker pull
docker pull ghcr.io/flix2net/subtitle-translator:latest
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Ant Design 6 + Tailwind CSS v4 + Glassmorphism theme
- **i18n**: next-intl (18 languages)
- **Storage**: IndexedDB (via idb) + localStorage
- **Deployment**: Docker, Vercel, GitHub Pages, GitHub Actions

## License

MIT

## Credits

Original project by [rockbenben/subtitle-translator](https://github.com/rockbenben/subtitle-translator). This fork adds new API providers, glassmorphism UI, 12+ Nvidia NIM models, API key help links, and subtitle editing tools.
