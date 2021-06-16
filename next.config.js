// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

module.exports = {
  webpack5: false,
  webpack: (config) => {
    return config;
  },
};

//Comment above and uncomment below to run bundle analzyer on build
// module.exports = withBundleAnalyzer({});
