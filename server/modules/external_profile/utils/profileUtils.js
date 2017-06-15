const utils = require('./common_utils');

// UTILS FUNCTIONS
const parseJson = (json, network) => {
  const profile = {
    id: json.id
  };

  switch (network) {
    case 'facebook':
      profile.displayName = json.name;
      profile.profileUrl = json.link;
      if (json.email) {
        profile.email = json.email;
      }
      if (json.picture) {
        if (typeof json.picture === 'object' && json.picture.data) {
          // October 2012 Breaking Changes
          profile.photos = json.picture.data.url;
        } else {
          profile.photos = json.picture;
        }
      }
      if (json.birthday) {
        profile.birthday = new Date(json.birthday);
      }
      break;
    case 'google':
      profile.displayName = json.displayName;
      profile.profileUrl = json.url;
      if (json && json.emails && json.emails[0]) {
        profile.email = json.emails[0].value;
      }
      if (json.image) {
        profile.photos = json.image.url;
      }
      break;
    case 'instagram':
      profile.id = json.data.id;
      profile.displayName = json.data.full_name;
      profile.photos = json.data.profile_picture;
  }

  profile.gender = json.gender;
  return profile;
};

// FUNCTIONS FOR EXPORT
const externalResponseToUser = (externalResponse, provider) => {
  const profile = parseJson(externalResponse, provider);

  const externalId = profile.id;
  const externalUrl = profile.profileUrl;
  const avatar = profile.photos ? profile.photos : '';
  const email = profile.email;
  const name = profile.displayName || '';
  const gender = profile.gender || '';
  const password = utils.generateKey('password');

  const userObj = {
    externalId: externalId,
    externalUrl: externalUrl,
    username: name,
    password: password,
    gender: gender,
    image: avatar,
  };
  if (profile.birthday) {
    userObj.birthday = profile.birthday;
  }
  if (email) {
    userObj.email = email;
  }
  return userObj;
};

// EXPORTING
module.exports.profileToUser = externalResponseToUser;
