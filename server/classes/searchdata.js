import Knex from '../config/db/knex_pgsql_data';
import LivingBeing from './living_being';

const table = 'hep';

/**
 * A class to handle users in DB
 */
class SearchData extends LivingBeing {

  /**
   * Class constructor
   *
   * @param {object} param - param of search
   */
  constructor(param) {
    super({ table, param });
    console.log("LOADING...");
    this.param = 1;
  }

  /**
   * Get user data by 'username'
   *
   * @param {array} columns - list of column names
   */
   /*
   select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;   
   return knex('books').select(knex.raw("data->'author' as author")).whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])      
   
   */
  get(columns) {
    return Knex(table)
      .whereRaw("(hep_header->>'payloadType')::int = ? ", this.param)
      .select(columns)
      .then(function (rows) {
        console.log("Found !");      
        rows.forEach(function(row){
            console.log(row);
        });           

        return rows;
      });
  }

}

export default SearchData;
