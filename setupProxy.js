const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://dev.stryx.co.kr:30071',
      changeOrigin: true,
      secure: false
    })
  );
};
