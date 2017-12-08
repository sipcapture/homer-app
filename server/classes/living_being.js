import Knex from '../config/db/knex';

/**
 * A class to handle living beings in DB
 */
class LivingBeing {

  /**
   * Class constructor
   *
   * @param {object} args - { table: 'db table name', guid: 'object id' }
   */
  constructor(args) {
    this.table = args.table;
    this.guid = args.guid;
  }

  /**
   * Add new object
   *
   * @param {object} properties - column names and values
   */
  add(properties) {
    return Knex(this.table).insert(properties);
  }

  /**
   * Update object by its 'guid'
   *
   * @param {object} properties - column names and values
   */
  update(properties) {
    return Knex(this.table)
      .where({
        guid: this.guid
      })
      .update(properties);
  }

  /**
   * Get all objects from 'this.table'
   *
   * @param {array} columns - list of column names
   */
  getAll(columns) {
    return Knex(this.table).select(columns);
  }

  /**
   * Get object by its 'guid' from 'this.table'
   *
   * @param {array} columns - list of column names
   */
  get(columns) {
    return Knex(this.table)
      .where({
        guid: this.guid
      })
      .select(columns)
      .then(function ([result]) {
        return result;
      });
  }
}

export default LivingBeing;
