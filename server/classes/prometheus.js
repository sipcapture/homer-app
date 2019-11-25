import LivingBeing from './living_being';

/**
 * A class to handle remote fetch from Prometheus
 */
class Prometheus extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} username
   */
  constructor(server, username) {
    super({db: server.databases.prometheus});
    this.promDb = server.databases.prometheus;
  }

  getValues(metrics, fromts, tots, precision) {

     let metricsQueries = [];

     /* need add check  for metrics */
     metrics.forEach((metricName) => {
        metricsQueries.push(
          this.promDb.get(`query_range?query=${metricName}&start=${fromts}&end=${tots}&step=${precision}`),
        );
     });

     return Promise.all(metricsQueries).then((responses) => {
          /*let resposeBody = [];
          responses.forEach((metric) => {
            resposeBody.push({
              name: metric.data.result[0].metric.__name__,
              values: metric.data.result[0].values,
            });
          });
          */
          return (responses);
     }).catch((err) => {
          return (err);
     });
  }
    
  getLabels() {
  
     let unixTimeStamp = (new Date().getTime())/1000;
     return this.promDb.get(`/label/__name__/values?_=${unixTimeStamp}`)
        .then((response) => {
          return (response.data);
        })
        .catch((err) => {
          return(err);
     });    
  }  
  
  getLabel(id) {
  
     let unixTimeStamp = (new Date().getTime())/1000;
     return this.promDb.get(`/label/${id}/values?_=${unixTimeStamp}`)
        .then((response) => {
          return (response.data);
        })
        .catch((err) => {
          return(err);
     });    
  }  
}

export default Prometheus;
