export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string): void {
    console.log(`[INFO] [${this.context}] ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] [${this.context}] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] [${this.context}] ${message}`);
  }

  debug(message: string): void {
    console.debug(`[DEBUG] [${this.context}] ${message}`);
  }
}

export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
