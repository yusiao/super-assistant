# Public Deployment

This is a static website. Deploy the folder:

```text
output/bazi-ziwei
```

## Fast Options

- Netlify: import the repository and use `output/bazi-ziwei` as the publish directory. The root `netlify.toml` already sets this.
- Cloudflare Pages: create a Pages project, set build command to empty, and output directory to `output/bazi-ziwei`.
- GitHub Pages: push this repository to GitHub, enable Pages with GitHub Actions as the source, then run the `Deploy BaZi Zi Wei Site` workflow.

## AI Image Generation

The partner portrait can call a Netlify Function:

```text
/.netlify/functions/generate-partner-image
```

Set one of these environment variables in Netlify:

```text
OPENAI_API_KEY=...
```

or:

```text
GEMINI_API_KEY=...
```

Optional settings:

```text
IMAGE_PROVIDER=openai
OPENAI_IMAGE_MODEL=gpt-image-1.5
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
IMAGE_SIZE=1024x1536
IMAGE_QUALITY=medium
IMAGE_OUTPUT_FORMAT=jpeg
```

GitHub Pages can still host the static chart page, but it cannot safely run AI image generation by itself because API keys must stay on a backend.

After deployment, share the generated `https://...` URL. Local `file:///C:/...` URLs only work on the same computer.
