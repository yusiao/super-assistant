# Public Deployment

This is a static website. Deploy the folder:

```text
output/bazi-ziwei
```

## Fast Options

- Netlify: import the repository and use `output/bazi-ziwei` as the publish directory. The root `netlify.toml` already sets this.
- Cloudflare Pages: create a Pages project, set build command to empty, and output directory to `output/bazi-ziwei`.
- GitHub Pages: push this repository to GitHub, enable Pages with GitHub Actions as the source, then run the `Deploy BaZi Zi Wei Site` workflow.

After deployment, share the generated `https://...` URL. Local `file:///C:/...` URLs only work on the same computer.
