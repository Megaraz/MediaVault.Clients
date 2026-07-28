"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogger = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const Error_1 = require("./Error");
class AsyncLock {
    queue = Promise.resolve();
    async runExclusive(work) {
        let release;
        const lock = new Promise((resolve) => {
            release = resolve;
        });
        const previous = this.queue;
        this.queue = this.queue.then(() => lock);
        await previous;
        try {
            return await work();
        }
        finally {
            release?.();
        }
    }
}
const fileLock = new AsyncLock();
class ErrorLogger {
    retentionPeriodMs;
    basePath;
    filename;
    constructor(configuration = {}) {
        this.retentionPeriodMs = configuration.retentionPeriodMs ?? 7 * 24 * 60 * 60 * 1000;
        this.basePath = configuration.basePath ?? process.cwd();
        this.filename = configuration.filename ?? "errors.log.ndjson";
    }
    get fullPath() {
        return (0, node_path_1.join)(this.basePath, this.filename);
    }
    async cleanOldLogs() {
        await fileLock.runExclusive(async () => {
            const logs = await this.getErrorLogsUnsafe();
            const cutoffDate = Date.now() - this.retentionPeriodMs;
            const recentLogs = logs.filter((log) => new Date(log.writeDate).getTime() >= cutoffDate);
            const lines = recentLogs.map((log) => JSON.stringify(log)).join("\n");
            await (0, promises_1.mkdir)((0, node_path_1.dirname)(this.fullPath), { recursive: true });
            await (0, promises_1.writeFile)(this.fullPath, lines.length > 0 ? `${lines}\n` : "", "utf-8");
        });
    }
    async getErrorLogs() {
        return fileLock.runExclusive(async () => this.getErrorLogsUnsafe());
    }
    async logErrorToFile(error) {
        const entry = {
            writeDate: new Date().toISOString(),
            code: error.code,
            description: error.description,
            errorType: Error_1.ErrorType[error.type] ?? String(error.type),
            exceptionMessage: this.getExceptionMessage(error.exception),
            stackTrace: this.getExceptionStack(error.exception)
        };
        await fileLock.runExclusive(async () => {
            await (0, promises_1.mkdir)(this.basePath, { recursive: true });
            await (0, promises_1.appendFile)(this.fullPath, `${JSON.stringify(entry)}\n`, "utf-8");
        });
    }
    async getErrorLogsUnsafe() {
        let content = "";
        try {
            content = await (0, promises_1.readFile)(this.fullPath, "utf-8");
        }
        catch (error) {
            if (isFileNotFoundError(error)) {
                return [];
            }
            throw error;
        }
        const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
        const logs = [];
        for (const line of lines) {
            const parsed = this.tryDeserializeLog(line);
            if (parsed) {
                logs.push(parsed);
            }
        }
        function isFileNotFoundError(error) {
            return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
        }
        return logs;
    }
    tryDeserializeLog(line) {
        try {
            return JSON.parse(line);
        }
        catch {
            return null;
        }
    }
    getExceptionMessage(exception) {
        if (exception instanceof globalThis.Error) {
            return exception.message;
        }
        if (typeof exception === "string") {
            return exception;
        }
        return undefined;
    }
    getExceptionStack(exception) {
        if (exception instanceof globalThis.Error) {
            return exception.stack;
        }
        return undefined;
    }
}
exports.ErrorLogger = ErrorLogger;
