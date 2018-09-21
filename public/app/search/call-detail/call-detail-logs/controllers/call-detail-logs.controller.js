import '../styles/angular-json-tree.css';

class CallDetailLogs {
  constructor($log) {
    'ngInject';
    this.$log = $log;
  }

  matchJSON(project) {
    if (this.searchText == null) return true;
    var searchTerms = splitTerms(this.searchText);
    var projectTerms = walkTerms(project.data);
    var unmatchedTerms = searchTerms.filter(function (searchTerm) {
      return projectTerms.filter(function (projectTerm) {
        return projectTerm.indexOf(searchTerm) !== -1;
      }).length === 0;
    });
    return unmatchedTerms.length === 0;
  }
}

export default CallDetailLogs;
