/*
 * HEPIC 2.0
 *
*/

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }
  return hash;
};

Date.prototype.stdTimezoneOffset = function() {
        var jan = new Date(this.getFullYear(), 0, 1);
        var jul = new Date(this.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

$.tmpl = function(str, obj) {
    do {
        var beforeReplace = str;
        str = str.replace(/#{([^}]+)}/g, function(wholeMatch, key) {
            var substitution = obj[$.trim(key)];
            return (substitution === undefined ? wholeMatch : substitution);
        });
        var afterReplace = str !== beforeReplace;
    } while (afterReplace);

    return str;
};


function defineExportTemplate() {
    return "HEPIC-#{destination_ip}-#{ruri_user}-#{date}";
}

