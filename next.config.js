//This adds a header to every page response
// module.exports = {
//   async headers() {
//     return [
//       {
//         source: '/(.*?)',
//         headers: [
//           {
//             key: 'X-About-Custom-Header',
//             value: 'about_header_value',
//           },
//         ],
//       },
//     ]
//   },
// }

module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes packages that depend on fs/module module
    if (!isServer) {
      config.node = { fs: 'empty', module: 'empty' };
    }

    return config;
  },
};

module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
