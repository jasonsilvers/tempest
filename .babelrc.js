module.exports = {
  presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]],
  plugins: [
    'babel-plugin-macros',
    'superjson-next',
    ['styled-components', { ssr: true, displayName: true }],
  ],
};
