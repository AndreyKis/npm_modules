/**
 * Created by User on 6/15/2017.
 */
const winston = require('winston');
const winstonError = require('winston-error');

// LOGGING
const errorLogger = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File(
      {
        filename: './logs/ErrorLog.log', level: 'error', handleExceptions: true,
        json: true,
        colorize: true,
        maxsize: '100000000' //100MBytes
      })
  ],
  exitOnError: false
});
winstonError(errorLogger, {
  pickedFields: {
    name: undefined,
    message: undefined,
    stack: undefined,
    status: 500
  }
});

const infoLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({filename: './logs/InfoLog.log', json: false})
  ],
  exitOnError: false,
  maxsize: '100000000' //100MBytes
});

module.exports.errorLogger = errorLogger;
module.exports.infoLogger = infoLogger;
