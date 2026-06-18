/**
 * UoM Category Constants
 *
 * Centralized UoM category definitions and mappings.
 * Categories: Mass, Count, Volume
 */

export const UOM_CATEGORIES = {
  MASS: "mass",
  COUNT: "count",
  VOLUME: "volume",
} as const;

export type UoMCategory =
  (typeof UOM_CATEGORIES)[keyof typeof UOM_CATEGORIES];

/**
 * UoM Category Compatibility Matrix
 *
 * Defines which category transitions are allowed during bulk upload.
 * Key = upload UoM category, Value = set of compatible master categories.
 *
 * Rules:
 * - Mass is always allowed (compatible with all)
 * - Same category is always compatible
 * - Volume ↔ Count is NEVER compatible (hard error)
 */
export const UOM_CATEGORY_COMPATIBILITY: Record<UoMCategory, UoMCategory[]> = {
  [UOM_CATEGORIES.MASS]: [
    UOM_CATEGORIES.MASS,
    UOM_CATEGORIES.COUNT,
    UOM_CATEGORIES.VOLUME,
  ],
  [UOM_CATEGORIES.COUNT]: [UOM_CATEGORIES.COUNT, UOM_CATEGORIES.MASS],
  [UOM_CATEGORIES.VOLUME]: [UOM_CATEGORIES.VOLUME, UOM_CATEGORIES.MASS],
};

/**
 * Material Master UoM Category Change Rules
 *
 * Defines which UoM category changes are allowed on Material Master update.
 * Key = current category, Value = allowed target categories.
 *
 * Rules:
 * - Mass → Any (allowed)
 * - Count → Mass/Count (allowed)
 * - Volume → Mass/Volume (allowed)
 * - Count ↔ Volume (blocked)
 */
export const MATERIAL_MASTER_UOM_CHANGE_RULES: Record<
  UoMCategory,
  UoMCategory[]
> = {
  [UOM_CATEGORIES.MASS]: [
    UOM_CATEGORIES.MASS,
    UOM_CATEGORIES.COUNT,
    UOM_CATEGORIES.VOLUME,
  ],
  [UOM_CATEGORIES.COUNT]: [UOM_CATEGORIES.COUNT, UOM_CATEGORIES.MASS],
  [UOM_CATEGORIES.VOLUME]: [UOM_CATEGORIES.VOLUME, UOM_CATEGORIES.MASS],
};
