"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromResult = fromResult;
exports.mapResult = mapResult;
const Result_1 = require("./Result");
function fromResult(result) {
    return Result_1.ResultOf.fromFailure(result);
}
function mapResult(result, map) {
    if (result.isFailure) {
        return fromResult(result);
    }
    return Result_1.ResultOf.success(map(result.value));
}
