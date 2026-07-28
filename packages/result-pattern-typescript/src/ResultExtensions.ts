import { ResultOf } from "./Result";

export function fromResult<TIn, TOut>(result: ResultOf<TIn>): ResultOf<TOut> {
  return ResultOf.fromFailure<TOut>(result);
}

export function mapResult<TIn, TOut>(result: ResultOf<TIn>, map: (value: TIn) => TOut): ResultOf<TOut> {
  if (result.isFailure) {
    return fromResult<TIn, TOut>(result);
  }
  return ResultOf.success(map(result.value) as NonNullable<TOut>);
}
