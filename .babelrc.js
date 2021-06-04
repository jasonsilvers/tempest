module.exports = (api) => {
  const isTest = api.env('test');

  // remove this part when https://github.com/vercel/next.js/issues/24566 is closed
  if (isTest) {
    return {
      presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]],
      plugins: ['babel-plugin-macros', 'superjson-next', ['styled-components', { ssr: true, displayName: true }]],
      env: {
        test: {
          plugins: ['dynamic-import-node'],
          presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        },
      },
    };
  }

  return {
    presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]],
    plugins: ['babel-plugin-macros', 'superjson-next', ['styled-components', { ssr: true, displayName: true }]],
  };
};
