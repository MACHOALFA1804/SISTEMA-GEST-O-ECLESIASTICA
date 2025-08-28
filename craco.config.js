module.exports = {
  babel: {
    plugins: [
      '@babel/plugin-transform-private-methods',
      '@babel/plugin-transform-class-properties',
      '@babel/plugin-transform-nullish-coalescing-operator',
      '@babel/plugin-transform-numeric-separator',
      '@babel/plugin-transform-optional-chaining',
      '@babel/plugin-transform-private-property-in-object'
    ]
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "assert": require.resolve("assert"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "os": require.resolve("os-browserify"),
          "url": require.resolve("url")
        }
      }
    }
  }
};
