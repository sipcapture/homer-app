import Knex from '../db/knex';
import LivingBeing from './living_being';

const table = 'birds';

/**
 * A class to handle birds in DB
 */
class Bird extends LivingBeing {
  
  /**
   * Class constructor
   *
   * @param {object} guid - bird guid
   */
  constructor(guid) {
    super({ table, guid });
    this.guid = guid;
  }

  /**
   * Get all birds 
   *
   * @param {array} columns - list of column names
   * @param {boolean} isPublic - public bird
   */
  getAll(columns, isPublic = true) {
    return Knex(table)
      .where({
        isPublic
      })
      .select(columns);
  }

}

export default Bird;
