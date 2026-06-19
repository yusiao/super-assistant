# Upload To Existing GitHub Repo

Repository:

```text
https://github.com/yusiao/super-assistant
```

## 1. Upload Site Files

Open this GitHub URL:

```text
https://github.com/yusiao/super-assistant/upload/main/output/bazi-ziwei
```

Upload these files from:

```text
C:\Users\Power\Desktop\super-assistant\output\bazi-ziwei
```

Required:

```text
.nojekyll
_headers
app.js
DEPLOY.md
GITHUB_UPLOAD_STEPS.md
index.html
styles.css
```

The `vendor` folder is not required for GitHub Pages because the public version uses jsDelivr CDN.

Commit message:

```text
Add BaZi Zi Wei web app
```

## 2. Upload GitHub Pages Workflow

Open this GitHub URL:

```text
https://github.com/yusiao/super-assistant/upload/main/.github/workflows
```

Upload:

```text
C:\Users\Power\Desktop\super-assistant\.github\workflows\bazi-ziwei-pages.yml
```

Commit message:

```text
Add BaZi Zi Wei Pages deploy workflow
```

## 3. Enable GitHub Pages

Go to:

```text
https://github.com/yusiao/super-assistant/settings/pages
```

Set:

```text
Source: GitHub Actions
```

## 4. Run The Workflow

Go to:

```text
https://github.com/yusiao/super-assistant/actions/workflows/bazi-ziwei-pages.yml
```

Click:

```text
Run workflow
```

After it finishes, the public URL should be:

```text
https://yusiao.github.io/super-assistant/
```
