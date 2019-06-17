Array.prototype.contains = function(fieldname, value) { 
  for(var i=0; i< this.length; i++){
            if(this[i][fieldname] && this[i][fieldname] == value) return true;
  }      
  return false;
}
                                                            

import './app.module';
import './app.config';
import './app.run';

