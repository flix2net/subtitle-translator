# Subtitle Translator

A blazing-fast, AI-powered batch subtitle translation tool that supports `.srt`, `.ass`, `.vtt`, and `.lrc` formats. Fork of [rockbenben/subtitle-translator](https://github.com/rockbenben/subtitle-translator) with enhanced API support, UI improvements, and powerful subtitle editing features.

## Features

- **Real-time translation** (~1 sec/episode) via chunked compression and parallel processing
- **Batch processing** for hundreds of subtitle files
- **50+ languages** with simultaneous multi-language translation
- **Context-aware AI translation** for natural dialogue
- **Bilingual output** with adjustable positioning
- **Subtitle extraction** for clean text export

### New Features (This Fork)

#### Additional Translation APIs
- **NVIDIA NIM** - Now defaults to `meta/llama-3.3-70b-instruct` via `integrate.api.nvidia.com`
- **Mistral AI** - `mistral-large-latest`, `codestral-latest`, etc.
- **Cohere** - `command-r-plus` and variants
- **xAI Grok** - `grok-3-latest`, `grok-3-fast`, `grok-3-mini`
- **LibreTranslate** - Free, self-hosted open-source translation

#### UI/UX Enhancements
- **API badges** - Free ⭐, Recommended, and tier indicators
- **Model presets** - One-click popular model selection per provider
- **Custom endpoint support** - Configure any OpenAI-compatible endpoint
- **Improved dark mode** - Better contrast and smoother transitions

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
git clone https://github.com/YOUR_USERNAME/subtitle-translator.git
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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fsubtitle-translator)

## Supported Translation APIs

### Free
- **GTX API** - Google Translate free endpoint
- **DeepLX** - Community DeepL proxy
- **LibreTranslate** - Self-hosted open-source

### Paid (LLM Models)
| Provider | Default Model | API Key |
|----------|--------------|---------|
| **NVIDIA NIM** ⭐ | `meta/llama-3.3-70b-instruct` | [build.nvidia.com](https://build.nvidia.com/) |
| **DeepSeek** ⭐ | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| **OpenAI** | `gpt-5.4-mini` | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Gemini** ⭐ | `gemini-2.5-flash` | [aistudio.google.com](https://aistudio.google.com/app/api-keys) |
| **Claude** | `claude-sonnet-4-6` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **Mistral AI** | `mistral-large-latest` | [console.mistral.ai](https://console.mistral.ai/api-keys/) |
| **Cohere** | `command-r-plus` | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| **xAI Grok** | `grok-3-latest` | [console.x.ai](https://console.x.ai/) |
| **Groq** ⭐ | `openai/gpt-oss-20b` | [console.groq.com](https://console.groq.com/keys) |
| **Perplexity** | `sonar` | [perplexity.ai](https://www.perplexity.ai/account/api/keys) |
| **OpenRouter** | `nvidia/nemotron-3-super-120b-a12b:free` | [openrouter.ai](https://openrouter.ai/settings/keys) |

⭐ = Recommended for subtitle translation quality

## Subtitle Tools

### Timestamp Shifting
Delay or advance all subtitle timestamps by a specified number of milliseconds. Useful when subtitles are out of sync with your video.

- **Positive value**: Delay subtitles (shift forward)
- **Negative value**: Advance subtitles (shift backward)

### Merge Lines
Combine consecutive short subtitle lines into a single entry. Helps reduce flickering and improves readability for fast dialogue.

### Split Lines
Automatically split long subtitle lines (>60 chars) at natural word boundaries. Ensures subtitles fit properly on screen.

### Glossary
Define custom terminology mappings (e.g., character names, technical terms) that will be applied before translation to ensure consistency.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_USE_LOCAL_API` | Use local API routes (Docker) | `false` |

### API Key Setup

All API keys can be entered directly in the app UI. They are stored in your browser's local storage and never sent to any server except the respective API provider.

## CI/CD

This project uses GitHub Actions for automated testing and deployment:

- **On PR**: Lint check + build verification
- **On merge to main**: Docker image built and pushed to GHCR

```bash
# Manual Docker pull
docker pull ghcr.io/YOUR_USERNAME/subtitle-translator:latest
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Ant Design 6 + Tailwind CSS v4
- **i18n**: next-intl (18 languages)
- **Storage**: IndexedDB (via idb) + localStorage
- **Deployment**: Docker, Vercel, GitHub Actions

## License

MIT

## Credits

Original project by [rockbenben/subtitle-translator](https://github.com/rockbenben/subtitle-translator). This fork adds new API providers, UI enhancements, and subtitle editing tools.
