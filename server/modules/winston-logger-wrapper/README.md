## Description

Module, intended to add winston logger to project as fast as possible. The preconfigured max file size is 100MB.

The module writes errors both to console and file. The file is generated in the folder, called `logs` in the same package
where the main boot file exists. 

The output file contains json objects with info for easier parse.

## Installation 

run 

`npm install --save external-profile`

## Usage

```javascript
const winstonLoggerWrapper = require('./modules/winston-logger-wrapper');
const someFunctionReturningPromise = () => new Promise((resolve, reject) => {
    // Some actions;
    resolve();
});

someFunctionReturningPromise()
    .then((someResult) => {
      winstonLoggerWrapper.infoLogger.info(someResult);
    })
    .catch((err) => {
      winstonLoggerWrapper.errorLogger.error(err);
    })
```
 
