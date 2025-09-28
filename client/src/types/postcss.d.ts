declare module '@tailwindcss/postcss' {
  import { Plugin } from 'postcss';
  const tailwindcssPlugin: Plugin;
  export = tailwindcssPlugin;
}
