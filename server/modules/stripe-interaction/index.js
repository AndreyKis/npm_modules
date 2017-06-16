/**
 * Created by User on 6/16/2017.
 */

module.exports = (stripeKey) => {
  const winstonLoggerWrapper = require('winston-logger-wrapper');
  const stripe = require('stripe')(stripeKey);

  const constants = require('./constants');

  // FUNCTIONS
  /**
   * Function two generate two tokens from input card or for test card
   * @param cardData
   * Parameter with card data. Can contain number, exp_month, exp_year, cvc and currency fields.
   * Test card used in case of absence
   * @param cb
   * Callback function, which has to be called on result. Promise resolved in case of absence.
   * @returns {Promise}
   */
  const generateTwoTokens = (cardData, cb) => {
    return new Promise((resolve, reject) => {
      const cardCredentials = cardData
        ? cardData
        : {
          number: '4000056655665556',
          exp_month: 12,
          exp_year: 2018,
          cvc: '123',
          currency: constants.currency
        };

      const tokens = [];
      stripe.tokens.create({card: cardCredentials})
        .then((token) => {
          tokens.push(token);
          return stripe.tokens.create({card: cardCredentials});
        })
        .then((token) => {
          tokens.push(token);
          cb ? cb(null, tokens) : resolve(tokens);
        })
        .catch((err) => {
          winstonLoggerWrapper.errorLogger.error(err);
          cb ? cb(err) : reject(err);
        });
    });
  };
  /**
   * Function to create customer and account by two card tokens
   * @param stripeTokens. Optional parameter. Object, that has to contain
   * customerStripeToken and accountStripeToken keys. Test card used in case of absence of this parameter
   * @param cb. Optional parameter. Callback, which has to be called on result. Promise resolved in case of absence
   * @returns {Promise}
   */
  const addPaymentMethod = (stripeTokens, cb) => {
    return new Promise((resolve, reject) => {
      const cardTokens = stripeTokens
        ? [stripeTokens.customerStripeToken, stripeTokens.accountStripeToken]
        : generateTwoTokens();
      let customerToken = cardTokens[0];
      let accountToken = cardTokens[1];

      if (!customerToken || !accountToken) {
        const err = new Error("Wrong data provided. Please, add json with keys customerStripeToken " +
          "and accountStripeToken");
        cb ? cb(err) : reject(err);
        return;
      }

      let result = {};
      stripe.customers.create({
        source: customerToken.id
      })
        .then((customer) => {
          result.createdCustomer = customer;
          return stripe.accounts.create({
            country: constants.country,
            type: "custom",
            external_account: accountToken.id
          });
        })
        .then((stripeAccount) => {
          result.createdAccount = stripeAccount;
          cb ? cb(null, result) : resolve(result);
        })
        .catch((err) => {
          winstonLoggerWrapper.errorLogger.error(err);
          cb ? cb(err) : reject(err);
        });
    })
  };
  /**
   * Function to update customer and account by two card tokens and customer and accounts ids
   * @param customerData. Optional parameter. Object, that has to contain customerId and accountId keys.
   * Customer and account, generated by test card used in case of absence of this parameter
   * @param stripeTokens. Optional parameter. Object, that has to contain customerStripeToken
   * and accountStripeToken keys. Test card used in case of absence of this parameter
   * @param cb. Optional parameter. Callback, which has to be called on result. Promise resolved in case of absence
   * @returns {Promise}
   */
  const editCard = (customerData, stripeTokens, cb) => {
    return new Promise((resolve, reject) => {
      if(customerData && !stripeTokens && !stripeTokens.length) {
        reject(new Error("Please, provide stripe tokens, when providing customer data. Otherwise, do not provide anything ar all"));
      }
      if(stripeTokens && stripeTokens.length && !customerData) {
        reject(new Error("Please, provide customer data along with stripe tokens. Otherwise, do not provide anything ar all"));
      }
      // Global function variables from Promises
      const result = {};
      let createdStripeUser;
      let createdTokens;

      new Promise((resolve, reject) => {
        if (stripeTokens && stripeTokens.customerStripeToken && stripeTokens.accountStripeToken) {
          resolve([stripeTokens.customerStripeToken, stripeTokens.accountStripeToken])
        } else {
          generateTwoTokens()
            .then((tokens) => {
              resolve(tokens);
            })
            .catch((err) => {
              reject(err);
            })
        }
      })

        .then((tokens) => {
          createdTokens = tokens;
          return new Promise((resolve, reject) => {
            if (customerData && customerData.customerId && customerData.accountId) {
              resolve(customerData)
            }
            addPaymentMethod(tokens)
              .then((createdCustomerData) => {
                resolve({
                  customerId: createdCustomerData.createdCustomer.id,
                  accountId: createdCustomerData.createdAccount.id
                });
              })
              .catch((err) => {
                reject(err);
              })
          })
        })
        .then((stripeUser) => {
          createdStripeUser = stripeUser;
          return stripe.customers.update(createdStripeUser.customerId, {source: customerToken});
        })
        .then((updatedCustomer) => {
          result.updatedCustomer = updatedCustomer;
          return stripe.accounts.update(createdStripeUser.accountId, {external_account: accountToken});
        })
        .then((updatedAccount) => {
          result.updatedAccount = updatedAccount;
          cb ? cb(null, result) : resolve(result);
        })
        .catch((err) => {
          cb ? cb(err) : reject(err);
        });
    })
  };
  //Stripe customer and account deleting by customer and account id
  // const deleteCard = (id, fk, cb) => {
  //   if (!id || !fk) {
  //     cb({status: 0, message: "Wrong data sent"});
  //     return;
  //   }
  //
  //   let userQuery = {
  //     include: {
  //       relation: 'stripeCustomers',
  //       scope: {
  //         where: {
  //           id: fk
  //         },
  //         include: {
  //           relation: 'events',
  //           scope: {
  //             where: {
  //               date_end: {gt: new Date()}
  //             }
  //           }
  //         }
  //       }
  //     }
  //   };
  //
  //   let currUserStripeCustomer;
  //   let transaction;
  //   let currUser;
  //
  //   promises.transactionPromise(User)
  //     .then((tx) => {
  //       transaction = tx;
  //       return User.findById(id, userQuery);
  //     })
  //     .then((user) => {
  //       // Check for customer existence
  //       let customerExists = user.stripeCustomers && user.stripeCustomers() && user.stripeCustomers().length;
  //       if (!customerExists) {
  //         throw({
  //           isCustom: true,
  //           message: "Customer id does not belong to the current user or does not exist at all"
  //         })
  //       }
  //
  //       currUserStripeCustomer = Object.assign(user.stripeCustomers()[0]);
  //
  //       // Check for upcoming events existence
  //       let upcomingEventsExist = currUserStripeCustomer.events && currUserStripeCustomer.events()
  //         && currUserStripeCustomer.events().length;
  //       if (upcomingEventsExist) {
  //         throw({
  //           isCustom: true,
  //           message: "There are upcoming events with this card, defined as payment method"
  //         })
  //       }
  //
  //       currUser = user;
  //       return currUser.stripeCustomers.destroy(currUserStripeCustomer.id, {transaction: transaction});
  //     })
  //     .then(() => {
  //       return stripe.customers.del(currUserStripeCustomer.stripeCustomerId);
  //     })
  //     .then(() => {
  //       return stripe.accounts.del(currUserStripeCustomer.externalAccountId);
  //     })
  //     .then(() => {
  //       return promises.commitTransactionPromise(transaction);
  //     })
  //     .then(() => {
  //       let result = {status: 1, message: "Success"};
  //       cb(null, result);
  //     })
  //     .catch((err) => {
  //       if (!err.isCustom) {
  //         errorLogger.error(err);
  //       }
  //       const errResult = {status: 0, message: err.message || err};
  //
  //       transaction.rollback((rollbackRes) => {
  //         if (rollbackRes) {
  //           errorLogger.error(rollbackRes);
  //           errResult.message = errResult.message + " ROLLBACK ERROR: " + rollbackRes.message;
  //         }
  //         cb({status: 0, message: errResult.message});
  //       });
  //     });
  // };

  //EXPORTING
  class Wrapper {
    constructor() {
      this.generateTwoTokens = generateTwoTokens;
      this.addPaymentMethod = addPaymentMethod;
      this.editCard = editCard;
      // this.deleteCard = deleteCard;
    }
  }
  return new Wrapper();
};
