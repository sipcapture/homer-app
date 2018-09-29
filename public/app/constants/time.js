function nowTimeUnix() {
  return new Date().getTime();
}

function startOfTheDayUnix() {
  return nowTimeUnix() - 24 * 3600;
}

export default {
  DEFAULT: 'Local',
  LABEL: 'Today',
  TIMEZONE: {},
  FROM: startOfTheDayUnix(),
  TO: nowTimeUnix()
};
