/**
 * Created by User on 6/15/2017.
 */
const promises = require('./promises');

// Functions
const getProfileByToken = function (token, externalType, cb) {
  return new Promise((resolve, reject) => {
    if (!token || !externalType) {
      reject({status: 0, message: "token or externalType missing"});
    }

    promises.socialRequestPromise(token, externalType)
      .then((result) => cb ? cb(null, result) : resolve(result))
      .catch((err) => cb ? cb(err) : reject(err));
  })
};

// EXPORTING
exports.getProfileByToken = getProfileByToken;
