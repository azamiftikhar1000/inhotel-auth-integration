const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './static/js/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
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
    proxy: {
      '/v1/public': {
        target: 'http://localhost:3005',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
      },
      '/public/v1': {
        target: 'http://localhost:3001',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
      }
    },
  },
}; 