class SearchHelper {
  constructor() {}

  hashCode(str) {
    let hash = 0;
    if (str) {
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return hash;
  }
}

export default SearchHelper;
