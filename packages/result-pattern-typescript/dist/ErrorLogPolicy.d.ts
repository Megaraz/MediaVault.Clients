import { ResultError } from "./Error";
export interface IErrorLogPolicy {
    shouldLog(error: ResultError): boolean;
}
export declare class ErrorLogPolicy implements IErrorLogPolicy {
    shouldLog(error: ResultError): boolean;
    private shouldLogHttpError;
}
