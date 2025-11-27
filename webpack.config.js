const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './static/js/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@chakra-ui/react': path.resolve(__dirname, 'node_modules/@chakra-ui/react'),
      'react-query': path.resolve(__dirname, 'node_modules/react-query'),
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25, // Increase max parallel requests
      minSize: 20000, // Minimum size for a chunk to be generated
      cacheGroups: {
        defaultVendors: false, // Disable default vendors group
        framework: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
          name: 'framework',
          chunks: 'all',
          priority: 40,
        },
        chakra: {
          test: /[\\/]node_modules[\\/]@chakra-ui[\\/]/,
          name: 'chakra',
          chunks: 'all',
          priority: 30,
        },
        emotion: {
          test: /[\\/]node_modules[\\/]@emotion[\\/]/,
          name: 'emotion',
          chunks: 'all',
          priority: 30,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 512 KiB
    maxAssetSize: 512000, // 512 KiB
  },
  devtool: process.env.NODE_ENV === 'development' ? 'eval-cheap-module-source-map' : false,
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: process.env.NODE_ENV === 'development',
          }
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    hot: true,
    open: true,
    compress: true,
    proxy: {
      '/v1/public': {
        target: 'https://platform-backend.inhotel.io',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
      },
      '/public/v1': {
        target: 'https://platform-backend.inhotel.io',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
      }
    },
  },
}; 