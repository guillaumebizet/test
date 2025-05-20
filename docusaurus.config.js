
// @ts-check
// Docusaurus config
const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;


module.exports = {
  title: 'SGEP Copilot Hub',
  tagline: 'Empowering collaborative AI adoption at Société Générale.',
  url: 'https://guillaumebizet.github.io',
  baseUrl: '/test/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'guillaumebizet', // Usually your GitHub org/user name.
  projectName: 'test', // Usually your repo name.
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'SGEP Copilot Hub',
      logo: {
        alt: 'SGEP Copilot Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/docs/why', label: 'Why?', position: 'left'},
        {to: '/docs/resources', label: 'Resources', position: 'left'},
        {to: '/docs/prompts', label: 'Prompts', position: 'left'},
        {to: '/docs/bugs', label: 'Bugs', position: 'left'},
        {to: '/docs/how-to-contribute', label: 'Contribute', position: 'right'},
        {to: '/docs/who', label: "Who's Who", position: 'right'},
        {to: '/docs/sponsors', label: 'Sponsors', position: 'right'},
      ],
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
};
