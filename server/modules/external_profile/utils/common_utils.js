/**
 * Created by User on 6/15/2017.
 */
const crypto = require('crypto');
// FUNCTIONS
const generateKey = (hmacKey, algorithm, encoding) => {
  algorithm = algorithm || 'sha1';
  encoding = encoding || 'hex';
  const hmac = crypto.createHmac(algorithm, hmacKey);
  const buf = crypto.randomBytes(32);
  hmac.update(buf);
  return hmac.digest(encoding);
};

// EXPORTING
module.exports.generateKey = generateKey;
