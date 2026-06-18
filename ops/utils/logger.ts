import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(chalk.blue(this.formatMessage("info", message, meta)));
  }

  warn(message: string, meta?: any): void {
    console.log(chalk.yellow(this.formatMessage("warn", message, meta)));
  }

  error(message: string, meta?: any): void {
    console.error(chalk.red(this.formatMessage("error", message, meta)));
  }

  debug(message: string, meta?: any): void {
    // only logs in non-production environments.
    if (process.env.NODE_ENV !== "production") {
      console.log(chalk.gray(this.formatMessage("debug", message, meta)));
    }
  }

  request(
    method: string,
    path: string,
    status: number,
    duration: number
  ): void {
    const color =
      status >= 500
        ? chalk.red
        : status >= 400
          ? chalk.yellow
          : status >= 300
            ? chalk.cyan
            : chalk.green;

    console.log(
      color(
        this.formatMessage("info", `${method} ${path} ${status} ${duration}ms`)
      )
    );
  }
}

export const logger = new Logger();
