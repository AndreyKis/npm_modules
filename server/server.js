const loopback = require('loopback');
const boot = require('loopback-boot');
const externalProfile = require('./modules/external_profile');

const app = module.exports = loopback();

app.use('/test', (req, res, next) => {
  externalProfile.getProfileByToken("4765739641.1677ed0.542d7428ed5d4d39a7a6300d11443680", 'instagram', (err, result) => {
    console.log("hello From then");
    next();
  });
  // profile.then((profileRes) => {
  //   console.log("hello From then");
  //   next();
  // })
});

app.use('/index', (req, res, next) => {
  next();
  // profile.then((profileRes) => {
  //   console.log("hello From then");
  //   next();
  // })
});

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
