export function isValidId<TKey>(id: TKey): boolean {
  if (id === null || id === undefined) {
    return false;
  }

  if (typeof id === "string") {
    return id.trim().length > 0 && id.toLowerCase() !== "00000000-0000-0000-0000-000000000000";
  }

  if (typeof id === "number") {
    return Number.isSafeInteger(id) && id > 0;
  }

  if (typeof id === "bigint") {
    return id > 0n;
  }

  return true;
}
