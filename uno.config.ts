import { defineConfig, toEscapedSelector as e, presetUno, presetIcons } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import { loadEnv } from 'vite'

const root = process.cwd()

const createPresetIcons = () => {
  const isBuild = !!process.argv[4]
  let env = {} as any
  if (!isBuild) {
    env = loadEnv(process.argv[3], root)
  } else {
    env = loadEnv(process.argv[4], root)
  }
  // @ts-ignore
  if (env.VITE_USE_ONLINE_ICON === 'true') {
    return []
  } else {
    return [
      presetIcons({
        prefix: ''
        // Since all icons are loaded by default, startup will be very slow. You can load the required icons here to ensure startup speed.
        // collections: {
        //   carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        //   mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        //   logos: () => import('@iconify-json/logos/icons.json').then(i => i.default),
        // }
      })
    ]
  }
}

export default defineConfig({
  // ...UnoCSS options
  rules: [
    [
      /^overflow-ellipsis$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
${selector} {
  text-overflow: ellipsis;
}
`
      }
    ],
    [
      /^custom-hover$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
${selector} {
  display: flex;
  height: 100%;
  padding: 1px 10px 0;
  cursor: pointer;
  align-items: center;
  transition: background var(--transition-time-02);
}
/* you can have multiple rules */
${selector}:hover {
  background-color: var(--top-header-hover-color);
}
.dark ${selector}:hover {
  background-color: var(--el-bg-color-overlay);
}
`
      }
    ],
    [
      /^layout-border__left$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
${selector}:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background-color: var(--el-border-color);
  z-index: 3;
}
`
      }
    ],
    [
      /^layout-border__right$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
${selector}:after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background-color: var(--el-border-color);
  z-index: 3;
}
`
      }
    ],
    [
      /^layout-border__top$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
${selector}:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--el-border-color);
  z-index: 3;
}
`
      }
    ],
    [
      /^layout-border__bottom$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
${selector}:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--el-border-color);
  z-index: 3;
}
`
      }
    ]
  ],
  presets: [presetUno({ dark: 'class', attributify: false }), ...createPresetIcons()],
  transformers: [transformerVariantGroup()],
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html|ts)($|\?)/]
    }
  }
})
