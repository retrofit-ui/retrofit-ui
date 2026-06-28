import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'retrofit-ui',
  description: 'Server-driven admin UI from your existing schemas',

  vite: {
    optimizeDeps: {
      exclude: ['@retrofit-ui/spa-solid-shoelace', 'msw'],
    },
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/what-is-retrofit-ui' },
      { text: 'Reference', link: '/reference/js-api' },
      { text: 'Examples', link: '/examples/todos' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            {
              text: 'What is retrofit-ui?',
              link: '/guide/what-is-retrofit-ui',
            },
            { text: 'Design philosophy', link: '/guide/design-philosophy' },
            { text: 'JS Quickstart', link: '/guide/js-quickstart' },
            { text: 'Java Quickstart', link: '/guide/java-quickstart' },
          ],
        },
        {
          text: 'Views',
          items: [
            { text: 'Table View', link: '/guide/table-view' },
            { text: 'Form View', link: '/guide/form-view' },
            { text: 'Workflow Bundle', link: '/guide/workflow-bundle' },
            { text: 'Markdown View', link: '/guide/markdown-view' },
            { text: 'Stat View', link: '/guide/stat-view' },
            { text: 'Timeline View', link: '/guide/timeline-view' },
            { text: 'Tree View', link: '/guide/tree-view' },
            { text: 'Calendar View', link: '/guide/calendar-view' },
          ],
        },
        {
          text: 'Adoption',
          items: [
            { text: 'Hosted SPA', link: '/guide/hosted-spa' },
            { text: 'Script Islands', link: '/guide/script-islands' },
            { text: 'SolidJS Components', link: '/guide/solidjs-components' },
            { text: 'Event Handling', link: '/guide/event-handling' },
          ],
        },
        {
          text: 'Customisation',
          items: [{ text: 'Theming', link: '/guide/theming' }],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'JS API', link: '/reference/js-api' },
            { text: 'Java API', link: '/reference/java-api' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Todos', link: '/examples/todos' },
            { text: 'Contacts', link: '/examples/contacts' },
            { text: 'Blog', link: '/examples/blog' },
          ],
        },
      ],
    },

    outline: [2, 3],
    search: { provider: 'local' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/retrofit-ui/retrofit-ui' },
    ],
  },
});
