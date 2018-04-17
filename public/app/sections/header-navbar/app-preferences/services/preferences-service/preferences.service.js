class PreferencesService {
  constructor(UserService) {
    this.UserService = UserService;
  }

  /*
  * Get all app preferences data with schema
  *
  * @return {object} app preferences data with schema
  *   {object} users
  *     {array} data
  *     {object} schema
  */
  async getDataAndSchema() {
    const res = {
      users: {},
    };

    try {
      res.users = await this.UserService.getAll();
      return res;
    } catch (err) {
      throw new Error(`fail to get app preferences data: ${err.message}`);
    }
  }
}

export default PreferencesService;
