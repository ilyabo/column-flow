import type { Accessor } from "./types";

export function getAccessorValue<T, TValue>(
  item: T,
  accessor: Accessor<T, TValue> | undefined,
  fallback: TValue
): TValue {
  if (!accessor) return fallback;
  if (typeof accessor === "function") {
    return accessor(item);
  }
  const value = item[accessor];
  return value == null ? fallback : (value as TValue);
}

export function getRequiredAccessorValue<T>(
  item: T,
  accessor: Accessor<T, string>,
  name: string
): string {
  const value = getAccessorValue(item, accessor, "");
  if (value == null || String(value).length === 0) {
    throw new Error(`ColumnFlow expected a non-empty ${name}.`);
  }
  return String(value);
}
