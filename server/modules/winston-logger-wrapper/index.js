/**
 * Created by User on 6/16/2017.
 */
const winston = require('winston');
const winstonError = require('winston-error');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const ensureFolderExists = require('./utils').ensureFolderExists;

class Wrapper {
  constructor() {
    ensureFolderExists(appDir + '/logs', '0744')
      .then(() => {
        // LOGGING
        this.errorLogger = new winston.Logger({
          transports: [
            new winston.transports.Console(),
            new winston.transports.File(
              {
                filename: appDir + '/logs' + '/ErrorLog.log', level: 'error', handleExceptions: true,
                json: true,
                colorize: true,
                maxsize: '100000000' //100MBytes
              })
          ],
          exitOnError: false
        });
        winstonError(this.errorLogger, {
          pickedFields: {
            name: undefined,
            message: undefined,
            stack: undefined,
            status: 500
          }
        });

        this.infoLogger = new (winston.Logger)({
          transports: [
            new (winston.transports.File)({filename: appDir + '/logs' + '/InfoLog.log', json: false})
          ],
          exitOnError: false,
          maxsize: '100000000' //100MBytes
        });
      })
      .catch((err) => {
        if (err.code !== 'EEXIST') {
          console.log("Failed to initialize logger repository: ", err);
        }
      });
  }
}

module.exports = new Wrapper();
