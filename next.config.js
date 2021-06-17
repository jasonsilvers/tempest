module.exports = {
  webpack: (config) => {
    // Unset client-side javascript that only works server-side
    config.resolve.fallback = { fs: false, module: false };

    return config;
  },
};

//Comment above and uncomment below to run bundle analyzer on build
// module.exports = withBundleAnalyzer({});
