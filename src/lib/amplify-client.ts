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
