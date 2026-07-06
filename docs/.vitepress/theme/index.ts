import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import BlogDemo from './BlogDemo.vue';
import ContactsDemo from './ContactsDemo.vue';
import ScenarioTimelines from './diagrams/ScenarioTimelines.vue';
import HomeLanding from './HomeLanding.vue';
import InteractiveChatDemo from './InteractiveChatDemo.vue';
import LandingDemo from './LandingDemo.vue';
import LiveDemo from './LiveDemo.vue';
import MultiViewDemo from './MultiViewDemo.vue';
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
    app.component('LandingDemo', LandingDemo);
    app.component('LiveDemo', LiveDemo);
    app.component('MultiViewDemo', MultiViewDemo);
    app.component('PreviewBlock', PreviewBlock);
    app.component('ScenarioTimelines', ScenarioTimelines);
    app.component('TodosDemo', TodosDemo);
  },
} satisfies Theme;
