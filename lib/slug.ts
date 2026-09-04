/**
 * lib/slug.ts
 * Slug normalization + uniqueness helper. The database unique constraint
 * on products.slug / categories.slug remains the final protection —
 * this just minimizes collisions before we hit the DB.
 */

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export const slugify = normalizeSlug;

/**
 * Given a base string and a function that checks whether a candidate slug
 * already exists, returns a unique slug — appending -2, -3, ... as needed.
 */
export async function generateUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = normalizeSlug(base) || "item";
  let candidate = root;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
    if (suffix > 500) {
      // Safety valve against pathological loops.
      candidate = `${root}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}
