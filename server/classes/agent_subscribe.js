import LivingBeing from './living_being';

const table = 'agent_location_session';

/**
 * A class to handle agent_subscribe in DB
 */
class AgentSubscribe extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} guid
   */
  constructor({server, guid}) {
    super({db: server.databases.config, table, guid});
    this.configDb = server.databases.config;
    this.guid = guid;
  }

  /**
   * Get agent_subscribe data
   *
   * @param {array} columns of agent_subscribe table
   * @return {object} agent_subscribe data
   */
  async get(columns) {
    try {
      return await super.get(columns);
    } catch (err) {
      throw new Error(`get agent_subscribe: ${err.message}`);
    }
  }

  /**
   * Get all agent_subscribe
   *
   * @param {array} columns of table
   * @return {array} agent_subscribe data
   */
  async getAll(columns) {
    try {
      return await super.getAll(columns);
    } catch (err) {
      throw new Error(`get all agent_subscribe: ${err.message}`);
    }
  }

  /**
   * Add agent_subscribe
   *
   * @param {object} properties of agent_subscribe
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await super.add(properties);
    } catch (err) {
      throw new Error(`add new agent_subscribe: ${err.message}`);
    }
  }

  /**
   * Update agent_subscribe
   *
   * @param {object} properties of agent_subscribe
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await super.update(properties);
    } catch (err) {
      throw new Error(`update agent_subscribe: ${err.message}`);
    }
  }

  /**
   * Delete agent_subscribe
   *
   * @return {object} confirm
   */
  async delete() {
    try {
      return await super.delete();
    } catch (err) {
      throw new Error(`delete agent_subscribe: ${err.message}`);
    }
  }
}

export default AgentSubscribe;
