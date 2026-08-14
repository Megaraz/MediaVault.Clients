"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @deprecated Compatibility surface for the existing Android client. New code
 * should import the platform-neutral API from `result-pattern-typescript`.
 */
__exportStar(require("./DatabaseError"), exports);
__exportStar(require("./Error"), exports);
__exportStar(require("./ErrorCode"), exports);
__exportStar(require("./ErrorReasonCodeExtensions"), exports);
__exportStar(require("./PaginationParameters"), exports);
__exportStar(require("./Result"), exports);
__exportStar(require("./ResultExtensions"), exports);
__exportStar(require("./ValidationError"), exports);
__exportStar(require("./Validator"), exports);
__exportStar(require("./ValidatorExtensions"), exports);
