// @ts-check
const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

module.exports = {
  title: 'SGEP Copilot Hub',
  tagline: 'Empowering collaborative AI adoption at Société Générale.',
  url: 'https://guillaumebizet.github.io',
  baseUrl: '/test/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'guillaumebizet',
  projectName: 'test',
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
          routeBasePath: '/', // <-- clé !
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
        {to: '/why', label: 'Why?', position: 'left'},
        {to: '/resources', label: 'Resources', position: 'left'},
        {to: '/prompts', label: 'Prompts', position: 'left'},
        {to: '/bugs', label: 'Bugs', position: 'left'},
        {to: '/fallout-rpg', label: 'Fallout RPG', position: 'left'},
        {to: '/how-to-contribute', label: 'Contribute', position: 'right'},
        {to: '/who', label: "Who's Who", position: 'right'},
        {to: '/sponsors', label: 'Sponsors', position: 'right'},
      ],
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
};
