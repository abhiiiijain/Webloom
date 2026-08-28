const DAYS = 86_400;
const HOURS = 3_600;
const MINUTES = 60;

const unit = (value: number, singular: string, plural: string) =>
  `${value} ${value === 1 ? singular : plural}`;

export const getUptime = () => {
  const totalSeconds = Math.floor(process.uptime());
  const days = Math.floor(totalSeconds / DAYS);
  const hours = Math.floor((totalSeconds % DAYS) / HOURS);
  const minutes = Math.floor((totalSeconds % HOURS) / MINUTES);
  const seconds = totalSeconds % MINUTES;

  return {
    days,
    hours,
    minutes,
    seconds,
    label: [
      unit(days, "day", "days"),
      unit(hours, "hour", "hours"),
      unit(minutes, "minute", "minutes"),
      unit(seconds, "second", "seconds"),
    ].join(", "),
  };
};
