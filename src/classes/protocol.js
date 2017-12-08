import Knex from '../config/db/knex';
import Promise from 'bluebird';
import callDiscoverData from './static_data/call_discover';

/**
 * A class to get protocol data
 */
class Protocol {

  /**
   * Class constructor
   *
   * @param {object} guid - bird guid
   */
  constructor() {}

  /**
   * Get transactions
   *
   * @param {integer} type - type of transaction
   * @param {string} transaction - transaction name
   */
  discover(type, transaction) {
    return new Promise(function (resolve) {
      resolve(callDiscoverData); // to-do: it is dummy temporary data, provide real data from DB
    });
  }
}

export default Protocol;
