/**
 * Created by User on 6/15/2017.
 */
const request = require('request');
const profileUtils = require('./utils/profileUtils');

const socialRequestPromise = function(token, externalType) {
  const requestBody = {
    qs: {
      access_token: token
    }
  };
  if (externalType === 'facebook') {
    requestBody.url = 'https://graph.facebook.com/me';
    requestBody.qs.fields = 'id,name,gender,birthday,email, first_name, last_name, ' +
      'middle_name, link, picture';
  } else if (externalType === 'google') {
    requestBody.url = 'https://www.googleapis.com/plus/v1/people/me';
  } else if (externalType === 'instagram') {
    requestBody.url = 'https://api.instagram.com/v1/users/self';
  }

  return new Promise(function (resolve, reject) {
    request.get(requestBody, function (err, response, body) {
      if (err) {
        reject(err);
      }
      if ('string' === typeof body) {
        body = JSON.parse(body);
      }
      if (body.error && body.error.errors) {
        reject(body.error.errors[0]);
      }
      if (body.error && body.error.message) {
        reject(body.error);
      }

      resolve(profileUtils.profileToUser(body, externalType));
    });
  });
};

module.exports.socialRequestPromise = socialRequestPromise;

