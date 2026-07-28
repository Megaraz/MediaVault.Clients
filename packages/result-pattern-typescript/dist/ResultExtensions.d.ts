import { ResultOf } from "./Result";
export declare function fromResult<TIn, TOut>(result: ResultOf<TIn>): ResultOf<TOut>;
export declare function mapResult<TIn, TOut>(result: ResultOf<TIn>, map: (value: TIn) => TOut): ResultOf<TOut>;
