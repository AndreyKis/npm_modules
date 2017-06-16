/**
 * Created by User on 6/16/2017.
 */
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs')); // adds Async() versions that return promises

module.exports.ensureFolderExists = (path, mask, cb) => {
  return new Promise((resolve, reject) => {
    if (typeof mask === 'function') { // allow the `mask` parameter to be optional
      cb = mask;
      mask = '0777';
    }
    fs.mkdirAsync(path, mask)
      .then(() => {
        cb ? cb(null) : resolve();
      })
      .catch((err) => {
        //Error or folder already exists
        err.code !== 'EEXIST'
          ? cb ? cb(err) : reject(err)
          : cb ? cb(null) : resolve();
      })
  });
};
