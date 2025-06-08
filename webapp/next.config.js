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
  }
}

module.exports = nextConfig
