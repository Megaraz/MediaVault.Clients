import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ErrorType, ResultError } from "./Error";

class AsyncLock {
  private queue: Promise<void> = Promise.resolve();

  public async runExclusive<T>(work: () => Promise<T>): Promise<T> {
    let release: (() => void) | undefined;
    const lock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.queue;
    this.queue = this.queue.then(() => lock);
    await previous;
    try {
      return await work();
    } finally {
      release?.();
    }
  }
}

const fileLock = new AsyncLock();

export interface ErrorLoggerConfiguration {
  retentionPeriodMs?: number;
  basePath?: string;
  filename?: string;
}

export interface ErrorLog {
  writeDate: string;
  code: string;
  description: string;
  errorType: string;
  exceptionMessage?: string;
  stackTrace?: string;
}

export interface IErrorLogger {
  cleanOldLogs(): Promise<void>;
  getErrorLogs(): Promise<readonly ErrorLog[]>;
  logErrorToFile(error: ResultError): Promise<void>;
}

export class ErrorLogger implements IErrorLogger {
  private readonly retentionPeriodMs: number;
  private readonly basePath: string;
  private readonly filename: string;

  public constructor(configuration: ErrorLoggerConfiguration = {}) {
    this.retentionPeriodMs = configuration.retentionPeriodMs ?? 7 * 24 * 60 * 60 * 1000;
    this.basePath = configuration.basePath ?? process.cwd();
    this.filename = configuration.filename ?? "errors.log.ndjson";
  }

  private get fullPath(): string {
    return join(this.basePath, this.filename);
  }

  public async cleanOldLogs(): Promise<void> {
    await fileLock.runExclusive(async () => {
      const logs = await this.getErrorLogsUnsafe();
      const cutoffDate = Date.now() - this.retentionPeriodMs;
      const recentLogs = logs.filter((log) => new Date(log.writeDate).getTime() >= cutoffDate);
      const lines = recentLogs.map((log) => JSON.stringify(log)).join("\n");
      await mkdir(dirname(this.fullPath), { recursive: true });
      await writeFile(this.fullPath, lines.length > 0 ? `${lines}\n` : "", "utf-8");
    });
  }

  public async getErrorLogs(): Promise<readonly ErrorLog[]> {
    return fileLock.runExclusive(async () => this.getErrorLogsUnsafe());
  }

  public async logErrorToFile(error: ResultError): Promise<void> {
    const entry: ErrorLog = {
      writeDate: new Date().toISOString(),
      code: error.code,
      description: error.description,
      errorType: ErrorType[error.type] ?? String(error.type),
      exceptionMessage: this.getExceptionMessage(error.exception),
      stackTrace: this.getExceptionStack(error.exception)
    };

    await fileLock.runExclusive(async () => {
      await mkdir(this.basePath, { recursive: true });
      await appendFile(this.fullPath, `${JSON.stringify(entry)}\n`, "utf-8");
    });
  }

  private async getErrorLogsUnsafe(): Promise<ErrorLog[]> {
    let content = "";
    try {
      content = await readFile(this.fullPath, "utf-8");
    } catch (error: unknown) {
      if (isFileNotFoundError(error)) {
        return [];
      }
      throw error;
    }

    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const logs: ErrorLog[] = [];
    for (const line of lines) {
      const parsed = this.tryDeserializeLog(line);
      if (parsed) {
        logs.push(parsed);
      }
    }

    function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
      return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
    }
    return logs;
  }

  private tryDeserializeLog(line: string): ErrorLog | null {
    try {
      return JSON.parse(line) as ErrorLog;
    } catch {
      return null;
    }
  }

  private getExceptionMessage(exception: unknown): string | undefined {
    if (exception instanceof globalThis.Error) {
      return exception.message;
    }
    if (typeof exception === "string") {
      return exception;
    }
    return undefined;
  }

  private getExceptionStack(exception: unknown): string | undefined {
    if (exception instanceof globalThis.Error) {
      return exception.stack;
    }
    return undefined;
  }
}
