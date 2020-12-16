const proxy = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(
    '/test',
    proxy({
      // target: 'http://127.0.0.1:82/',
      target: 'http://127.0.0.1:80/',
      changeOrigin: true,
      pathRewrite: { '^/test': '' },
    })
  );
};