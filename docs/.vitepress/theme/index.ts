import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import BlogDemo from './BlogDemo.vue';
import ContactsDemo from './ContactsDemo.vue';
import HomeLanding from './HomeLanding.vue';
import InteractiveChatDemo from './InteractiveChatDemo.vue';
import LiveDemo from './LiveDemo.vue';
import PreviewBlock from './PreviewBlock.vue';
import TodosDemo from './TodosDemo.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BlogDemo', BlogDemo);
    app.component('ContactsDemo', ContactsDemo);
    app.component('HomeLanding', HomeLanding);
    app.component('InteractiveChatDemo', InteractiveChatDemo);
    app.component('LiveDemo', LiveDemo);
    app.component('PreviewBlock', PreviewBlock);
    app.component('TodosDemo', TodosDemo);
  },
} satisfies Theme;
