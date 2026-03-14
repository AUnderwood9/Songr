type FieldRule =
  | { type: "string"; required?: boolean; min?: number; max?: number }
  | { type: "number"; required?: boolean; min?: number; max?: number }
  | { type: "boolean"; required?: boolean };

type Schema = Record<string, FieldRule>;

type InferType<R extends FieldRule> = R["type"] extends "string"
  ? string
  : R["type"] extends "number"
    ? number
    : R["type"] extends "boolean"
      ? boolean
      : never;

type InferSchema<S extends Schema> = {
  [K in keyof S]: S[K]["required"] extends false
    ? InferType<S[K]> | undefined
    : InferType<S[K]>;
};

type ValidationResult<S extends Schema> =
  | { success: true; data: InferSchema<S> }
  | { success: false; errors: string[] };

export function validate<S extends Schema>(
  input: unknown,
  schema: S
): ValidationResult<S> {
  if (typeof input !== "object" || input === null) {
    return { success: false, errors: ["Request body must be a JSON object"] };
  }

  const record = input as Record<string, unknown>;
  const errors: string[] = [];
  const data: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = record[field];
    const required = rule.required !== false;

    if (value === undefined || value === null) {
      if (required) errors.push(`${field} is required`);
      continue;
    }

    if (typeof value !== rule.type) {
      errors.push(`${field} must be a ${rule.type}`);
      continue;
    }

    if (rule.type === "string" && typeof value === "string") {
      if (rule.min !== undefined && value.length < rule.min)
        errors.push(`${field} must be at least ${rule.min} characters`);
      if (rule.max !== undefined && value.length > rule.max)
        errors.push(`${field} must be at most ${rule.max} characters`);
    }

    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min)
        errors.push(`${field} must be at least ${rule.min}`);
      if (rule.max !== undefined && value > rule.max)
        errors.push(`${field} must be at most ${rule.max}`);
    }

    data[field] = value;
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: data as InferSchema<S> };
}
