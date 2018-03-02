import Promise from 'bluebird';

class CallDetailInfo {
  constructor($log, SearchService) {
    'ngInject';
    this.$log = $log;
    this.SearchService = SearchService;
    this.defaults = {
      scrollWheelZoom: false,
    };
  }

  $onChanges(bindings) {
    if (bindings.transaction.currentValue) {
      this.leaflet = {};
      this.geomarkers = {};
      this.prepareGeo(bindings.transaction.currentValue).then(() => {
        this.leaflet = {
          lat: this.geocenter.lat,
          lng: this.geocenter.lan,
          zoom: 4,
        };
      }).catch((err) => {
        this.$log.error(['CallDetailInfo'], err);
      });
    }

    if (bindings.messages.currentValue) {
      this.doctor = this.prepareDoctor(bindings.messages.currentValue);
    }
  }

  prepareDoctor(messages) {
    const doctor = {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
      auth: 0,
      ring: 0,
    };
    messages.forEach(function(msg) {
      if (msg.reply_reason >= 500) doctor.five++;
      else if (msg.reply_reason == 401 || msg.reply_reason == 407) doctor.auth++;
      else if (msg.reply_reason >= 400) doctor.four++;
      else if (msg.reply_reason >= 300) doctor.three++;
      else if (msg.reply_reason >= 200) doctor.two++;
      else if (msg.reply_reason >= 180) doctor.ring++;
      else if (msg.reply_reason >= 100) doctor.one++;
    });
    return doctor;
  }

  prepareGeo(transaction) {
    return Promise.map(Object.keys(transaction), (key) => {
      try {
        if (transaction[key].geo_lat && transaction[key].geo_lan) {
          this.geocenter = {
            lat: transaction[key].geo_lat,
            lan: transaction[key].geo_lan,
          };

          this.geomarkers[transaction[key].source_ip.split('.').join('')] = {
            lat: transaction[key].geo_lat,
            lng: transaction[key].geo_lan,
            message: 'A-Party<br>' + transaction[key].source_ip + ':' + transaction[key].source_port,
            focus: true,
            draggable: false,
          };
      
          if (transaction[key].dest_lat && transaction[key].dest_lan) {
            this.geomarkers[transaction[key].destination_ip.split('.').join('')] = {
              lat: transaction[key].dest_lat,
              lng: transaction[key].dest_lan,
              message: 'B-Party<br>' + transaction[key].destination_ip + ':' + transaction[key].destination_port,
              focus: false,
              draggable: false,
            };
          }

          if (transaction[key].destination_ip && (!transaction[key].dest_lat || transaction[key].dest_lat == 0)
            && this.SearchService.searchGeoLoc) {
            return this.search(transaction[key].destination_ip, transaction[key].destination.port);
          }
        }
      } catch (err) {
        throw new Error(`fail to prepare geo data, ${err}`);
      }
    });
  }

  search(ip, port) {
    return this.SearchService.searchGeoLoc(ip).then((results) => {
      if (!results.lat && !results.lon) {
        return;
      }

      this.enableLogReport = true;
      this.LiveLogs.push({
        data: {
          type: 'Geo Lookup',
          data: results,
        },
      });
    
      this.geomarkers[ip.split('.').join('')] = {
        lat: results.lat,
        lng: results.lon,
        message: 'B-Party IP<br>' + ip + ':' + port,
        focus: false,
        draggable: false,
      };
    }).catch((err) => {
      throw new Error(`fail to search geo location, ${err}`);
    });
  }
}

export default CallDetailInfo;
