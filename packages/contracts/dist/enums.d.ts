/** Numeric values serialized by MediaVault.Api. */
export declare const MediaType: {
    readonly Movie: 0;
    readonly TvSeries: 1;
    readonly Book: 2;
    readonly Manga: 3;
    readonly Game: 4;
};
export type MediaType = (typeof MediaType)[keyof typeof MediaType];
/** Numeric values serialized by MediaVault.Api. */
export declare const Status: {
    readonly Ongoing: 0;
    readonly Completed: 1;
    readonly Backlog: 2;
    readonly Dropped: 3;
    readonly CaughtUp: 4;
};
export type Status = (typeof Status)[keyof typeof Status];
//# sourceMappingURL=enums.d.ts.map