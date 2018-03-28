/**
 * A class to handle living beings in DB
 */
class LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} args - { table: 'db table name', guid: 'object id', db: 'Knex DB connection' }
   */
  constructor(args) {
    this.table = args.table;
    this.guid = args.guid;
    this.db = args.db;
  }

  /**
   * Add new object
   *
   * @param {object} properties - column names and values
   * @return {object} confirm
   */
  add(properties) {
    return this.db(this.table).insert(properties);
  }

  /**
   * Update object by its 'guid'
   *
   * @param {object} properties - column names and values
   * @return {object} confirm
   */
  update(properties) {
    return this.db(this.table)
      .where({
        guid: this.guid,
      })
      .update(properties);
  }

  /**
   * Get all objects from 'this.table'
   *
   * @param {array} columns - list of column names
   * @return {array} add table data
   */
  getAll(columns) {
    return this.db(this.table).select(columns);
  }

  /**
   * Get object by its 'guid' from 'this.table'
   *
   * @param {array} columns - list of column names
   * @return {array} table data
   */
  get(columns) {
    return this.db(this.table)
      .where({
        guid: this.guid,
      })
      .select(columns)
      .then(function([result]) {
        return result;
      });
  }
}

export default LivingBeing;
