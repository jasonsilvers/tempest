const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  webpack: (config) => {
    // Unset client-side javascript that only works server-side
    config.resolve.fallback = { fs: false, module: false, process: require.resolve('process/browser') };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/styled-engine': '@mui/styled-engine-sc',
    };

    if (process.env.ANALYZE === 'true') {
      config.plugins.push(new DuplicatePackageCheckerPlugin());
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
});

//Comment above and uncomment below to run bundle analyzer on build
// module.exports = withBundleAnalyzer({});
