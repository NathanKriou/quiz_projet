const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  outputDir: 'dist',
  publicPath: '/',
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://api.example.com', 
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  },
  css: {
    loaderOptions: {

    }
  }
});
