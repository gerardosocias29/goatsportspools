import moment from 'moment-timezone';

const convertUTCToTimeZone = (dateString, format = "YYYY-MM-DD HH:mm:ss") => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = moment.utc(dateString);
  const localDate = utcDate.tz(userTimeZone);
  return localDate.format(format);
};

export default convertUTCToTimeZone;
