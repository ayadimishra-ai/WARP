/**
 * Console logging utility with ANSI color codes for better debugging
 * Supports different log levels with color coding
 */

// ANSI Color Codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

/**
 * Formats a log message with timestamp and color
 */
const formatMessage = (
  level: string,
  color: string,
  message: string,
  data?: any
): string => {
  const timestamp = new Date().toISOString();
  const prefix = `${color}[${timestamp}] [${level}]${colors.reset}`;

  if (data) {
    return `${prefix} ${message}\n${colors.gray}${JSON.stringify(
      data,
      null,
      2
    )}${colors.reset}`;
  }

  return `${prefix} ${message}`;
};

/**
 * Logger utility with colored output
 */
export const logger = {
  /**
   * Error messages - Red color
   */
  error: (message: string, data?: any) => {
    console.error(formatMessage("ERROR", colors.red, message, data));
  },

  /**
   * Warning messages - Yellow color
   */
  warn: (message: string, data?: any) => {
    console.warn(formatMessage("WARN", colors.yellow, message, data));
  },

  /**
   * Info messages - Blue color
   */
  info: (message: string, data?: any) => {
    console.info(formatMessage("INFO", colors.blue, message, data));
  },

  /**
   * Success messages - Green color
   */
  success: (message: string, data?: any) => {
    console.log(formatMessage("SUCCESS", colors.green, message, data));
  },

  /**
   * Debug messages - Gray color
   */
  debug: (message: string, data?: any) => {
    console.log(formatMessage("DEBUG", colors.gray, message, data));
  },

  /**
   * General log messages - Cyan color
   */
  log: (message: string, data?: any) => {
    console.log(formatMessage("LOG", colors.cyan, message, data));
  },

  /**
   * Process step messages - Magenta color
   */
  step: (stepNumber: number, message: string, data?: any) => {
    const stepMsg = `Step ${stepNumber}: ${message}`;
    console.log(formatMessage("STEP", colors.magenta, stepMsg, data));
  },

  /**
   * Start of operation - Bright Green
   */
  start: (operation: string, data?: any) => {
    const startMsg = `🚀 Starting ${operation}`;
    console.log(
      formatMessage("START", `${colors.bright}${colors.green}`, startMsg, data)
    );
  },

  /**
   * End of operation - Bright Blue
   */
  end: (operation: string, data?: any) => {
    const endMsg = `✅ Completed ${operation}`;
    console.log(
      formatMessage("END", `${colors.bright}${colors.blue}`, endMsg, data)
    );
  },

  /**
   * Performance timing - Bright Yellow
   */
  timing: (operation: string, startTime: number) => {
    const duration = Date.now() - startTime;
    const timingMsg = `⏱️ ${operation} took ${duration}ms`;
    console.log(
      formatMessage("TIMING", `${colors.bright}${colors.yellow}`, timingMsg)
    );
  },
};

/**
 * AI Statistics specific logger with context
 */
export const aiLogger = {
  start: (formId: string, invitationId: string) => {
    logger.start("AI Statistics Calculation", { formId, invitationId });
  },

  step: (stepNumber: number, message: string, data?: any) => {
    logger.step(stepNumber, `[AI Stats] ${message}`, data);
  },

  info: (message: string, data?: any) => {
    logger.info(`[AI Stats] ${message}`, data);
  },

  debug: (message: string, data?: any) => {
    logger.debug(`[AI Stats] ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    logger.warn(`[AI Stats] ${message}`, data);
  },

  error: (message: string, data?: any) => {
    logger.error(`[AI Stats] ${message}`, data);
  },

  success: (message: string, data?: any) => {
    logger.success(`[AI Stats] ${message}`, data);
  },

  end: (formId: string, invitationId: string, result?: any) => {
    logger.end("AI Statistics Calculation", {
      formId,
      invitationId,
      hasResult: !!result,
    });
  },

  timing: (operation: string, startTime: number) => {
    logger.timing(`[AI Stats] ${operation}`, startTime);
  },
};

export default logger;
