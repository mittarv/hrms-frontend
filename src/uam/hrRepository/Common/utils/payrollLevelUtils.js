const LEGACY_LEVEL_KEYS = {
  FTE: new Set(Array.from({ length: 15 }, (_, index) => String(index))), // 0-14
  OFTE_PTE: new Set(["15", "16", "17"]),
  INTERN: new Set(["18", "19"]),
};

const ALL_LEGACY_LEVEL_KEYS = new Set([
  ...LEGACY_LEVEL_KEYS.FTE,
  ...LEGACY_LEVEL_KEYS.OFTE_PTE,
  ...LEGACY_LEVEL_KEYS.INTERN,
]);

const parseLevelKey = (key) => {
  const parsed = Number.parseInt(String(key), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const isCustomLevelKey = (key) => {
  const keyString = String(key);
  const parsed = parseLevelKey(key);

  // Treat non-legacy keys (including non-numeric keys like "level_garvit") as custom.
  if (parsed === null) {
    return !ALL_LEGACY_LEVEL_KEYS.has(keyString);
  }

  return parsed >= 20 || !ALL_LEGACY_LEVEL_KEYS.has(keyString);
};

const shouldIncludeLevel = (employeeType, key) => {
  if (!employeeType) {
    return true;
  }

  const normalizedEmployeeType = String(employeeType).toUpperCase();
  const keyString = String(key);

  if (normalizedEmployeeType === "FTE") {
    return LEGACY_LEVEL_KEYS.FTE.has(keyString) || isCustomLevelKey(keyString);
  }

  if (normalizedEmployeeType === "OFTE" || normalizedEmployeeType === "PTE") {
    return LEGACY_LEVEL_KEYS.OFTE_PTE.has(keyString) || isCustomLevelKey(keyString);
  }

  if (normalizedEmployeeType === "INTERN" || normalizedEmployeeType === "EXTENDED INTERN") {
    return LEGACY_LEVEL_KEYS.INTERN.has(keyString) || isCustomLevelKey(keyString);
  }

  return true;
};

export const getFilteredLevelEntries = (levelDropdown = {}, employeeType = "") => {
  if (!levelDropdown || typeof levelDropdown !== "object") {
    return [];
  }

  return Object.entries(levelDropdown).filter(([key]) => shouldIncludeLevel(employeeType, key));
};

export const getFilteredLevelValues = (levelDropdown = {}, employeeType = "") => {
  return getFilteredLevelEntries(levelDropdown, employeeType).map(([, value]) => value);
};

export const getFilteredLevelOptions = (levelDropdown = {}, employeeType = "") => {
  return getFilteredLevelEntries(levelDropdown, employeeType).map(([key, value]) => ({
    key,
    value,
  }));
};
