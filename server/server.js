const loopback = require('loopback');
const boot = require('loopback-boot');
const externalProfile = require('./modules/external-profile');
const stripe = require('./modules/stripe-interaction')('sk_test_u695NpdETpOy0TkDhex7ujib');
const winstonLoggerWrapper = require('./modules/winston-logger-wrapper');

const app = module.exports = loopback();

app.use('/external/test', (req, res, next) => {
  externalProfile.getProfileByToken("4765739641.1677ed0.542d7428ed5d4d39a7a6300d11443680dfdfdf", 'instagram')
    .then((profile) => {
      console.log(profile);
    })
    .catch((err) => {
      console.err(err);
    })
});

app.use('/winston/test', (req, res, next) => {
  winstonLoggerWrapper.errorLogger.error(new Error("Test error"));
  winstonLoggerWrapper.infoLogger.info(new Error("Test info"));
});

app.use('/stripe/test', (req, res, next) => {
  stripe.generateTwoTokens()
    .then((tokens) => {
      return stripe.addPaymentMethod({customerStripeToken: tokens[0], accountStripeToken: tokens[1]});
    })
    .then((stripeUserInfo) => {
      return stripe.editCard({
        customerId: stripeUserInfo.createdCustomer.id,
        accountId: stripeUserInfo.createdAccount.id
      });
    })
    .then((editedCard) => {
      console.log(editedCard);
    })
    .catch((err) => {
      winstonLoggerWrapper.errorLogger.error(err);
    })
});

app.use('/index', (req, res, next) => {
  next();
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
