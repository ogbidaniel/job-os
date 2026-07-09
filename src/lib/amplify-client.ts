import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

/**
 * The single Amplify Data client for the whole app.
 *
 * Only feature service modules (src/features/<feature>/api/) may import
 * this; UI components and hooks go through those services.
 */
export const client = generateClient<Schema>();

interface DataEnvelope<T> {
  data: T;
  errors?: ReadonlyArray<{ message: string }>;
}

/**
 * Converts the Amplify `{ data, errors }` envelope into data-or-throw so
 * callers (and TanStack Query error states) get real exceptions.
 */
export function unwrap<T>(result: DataEnvelope<T>): T {
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }
  return result.data;
}

/**
 * Like unwrap, but for operations that must return data (create/update/
 * custom queries): missing data becomes an error instead of null.
 */
export function unwrapRequired<T>(result: DataEnvelope<T | null | undefined>): T {
  const data = unwrap(result);
  if (data === null || data === undefined) {
    throw new Error("The operation returned no data");
  }
  return data;
}
