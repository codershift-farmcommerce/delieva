/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['rc-util', 'antd', '@ant-design', 'rc-pagination', 'rc-picker'],
  webpack: (config, { dev, isServer }) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    }
    // Disable cache in production to prevent serialization warnings
    if (!dev) {
      config.cache = false
    }
    return config
  },
  // Configure HMR to use localhost instead of production domain
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Force HMR to use correct host
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Configure dev server for proper HMR
  experimental: {
    // Ensure HMR works correctly in containerized environments
    ...(process.env.NODE_ENV === 'development' && {
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
    }),
  },
}

module.exports = nextConfig
