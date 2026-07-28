import { ResultError } from "./Error";
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
export declare class ErrorLogger implements IErrorLogger {
    private readonly retentionPeriodMs;
    private readonly basePath;
    private readonly filename;
    constructor(configuration?: ErrorLoggerConfiguration);
    private get fullPath();
    cleanOldLogs(): Promise<void>;
    getErrorLogs(): Promise<readonly ErrorLog[]>;
    logErrorToFile(error: ResultError): Promise<void>;
    private getErrorLogsUnsafe;
    private tryDeserializeLog;
    private getExceptionMessage;
    private getExceptionStack;
}
