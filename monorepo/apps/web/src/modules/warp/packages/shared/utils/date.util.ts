const now: ({}) => Date | Number = (isNumber = true) =>
  isNumber ? Date.now() : new Date();

export const DateUtil = { now };
