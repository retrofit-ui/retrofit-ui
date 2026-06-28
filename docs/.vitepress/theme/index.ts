import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PreviewBlock from './PreviewBlock.vue'
import LiveDemo from './LiveDemo.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PreviewBlock', PreviewBlock)
    app.component('LiveDemo', LiveDemo)
  },
} satisfies Theme
