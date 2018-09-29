function nowTimeUnix() {
  return new Date().getTime();
}

function startOfTheDayUnix() {
  return nowTimeUnix() - 24 * 3600;
}

export default {
  LIMIT: 200,
  QUERY: {
    DEFAULT: { '1_call': [] }
  },
  TRANSACTION: {
    DEFAULT: {}
  },
  TIMEZONE: {},
  FROM: startOfTheDayUnix(),
  TO: nowTimeUnix()
};
