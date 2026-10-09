import { defineConfig } from 'vite';
import { storeConfig as s } from './src/config/store.js';

const escapeAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Troca {{TOKENS}} do index.html pelos valores de src/config/store.js (nome, favicon, SEO). */
const storeHtml = () => ({
  name: 'store-html',
  transformIndexHtml(html) {
    const values = {
      STORE_NAME: s.name,
      TITLE_SUFFIX: s.seo.titleSuffix,
      DESCRIPTION: s.seo.description,
      THEME_COLOR: s.themeColor,
      FAVICON: s.favicon,
      SHARE_IMAGE: s.seo.shareImage,
    };
    return Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{{${key}}}`, escapeAttr(value)), html);
  },
});

export default defineConfig({
  plugins: [storeHtml()],
  build: {
    target: 'es2020',
    cssMinify: true,
    chunkSizeWarningLimit: 300,
  },
});
