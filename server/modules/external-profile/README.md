## Description

Module, intended to parse profile from external sources like facebook, google and instagram and 
return json with all info collected. 

The only thing required is access token with enough privileges.

## INSTALLATION

run 

`npm install --save external-profile`

## Usage
```javascript
const externalProfile = require('external-profile');
externalProfile.getProfileByToken("yourAccessToken", 'facebook | google | instagram')
    .then((profile) => {
      console.log(profile);
    })
    .catch((err) => {
      console.err(err);
    })
```

## API Description

The only method is used in this package. Just call function `getProfileByToken(token, externalType, cb)`, 
where parameters mean next:

1. `token` stands for OAuth access token of an external source.
2. `externalType` defines the type of external source, which can be facebook, google or instagram
3. `cb` is an optional parameter. It is a callback function, which has to be called. The returned promise will be
resolved in case of cb absence.
