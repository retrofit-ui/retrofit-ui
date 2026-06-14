import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'retrofit-ui',
  description: 'Server-driven admin UI from your existing schemas',

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
