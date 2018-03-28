import LivingBeing from './living_being';

const table = 'birds';

/**
 * A class to handle birds in DB
 */
class Bird extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} guid - bird guid
   */
  constructor(server, guid) {
    super({db: server.databases.config, table, guid});
    this.configDb = server.databases.config;
    this.guid = guid;
  }

  /**
   * Get all birds
   *
   * @param {array} columns - list of column names
   * @param {boolean} isPublic - public bird
   * @return {array} data from table
   */
  getAll(columns, isPublic = true) {
    return configDb(table)
      .where({
        isPublic,
      })
      .select(columns);
  }
}

export default Bird;
