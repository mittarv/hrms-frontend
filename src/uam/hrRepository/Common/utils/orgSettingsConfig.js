// ============================================================================
// orgSettingsConfig.js — Centralized Org-Settings-driven configuration
// ============================================================================
// All behavioral rules that depend on employee types or org-level dropdown
// values live here. Components should import helpers from this file instead
// of hardcoding strings like "FTE", "Intern", etc.
// ============================================================================

/**
 * Helper to safely get the mapped behavior for a given employee type.
 * Evaluates against getAllComponentType.employee_type_mapping.
 */
const getMappedBehavior = (getAllComponentType, empTypeKey) => {
  if (!getAllComponentType?.employee_type_mapping || !empTypeKey) return {};
  
  // 1. Try to find if the passed empTypeKey matches a dropdown value (e.g., "FTE").
  // If so, get its actual ID key (e.g., "1").
  const dropdown = getAllComponentType.emp_type_dropdown || {};
  const foundKey = Object.keys(dropdown).find(
    key => String(dropdown[key]).trim().toLowerCase() === String(empTypeKey).trim().toLowerCase()
  );
  
  // 2. If we found the ID key and it exists in the mapping, use it (Prioritize UI-saved mappings)
  if (foundKey && getAllComponentType.employee_type_mapping[foundKey]) {
    return getAllComponentType.employee_type_mapping[foundKey];
  }

  // 3. Fallback: try direct lookup using the passed key (handles seeded defaults like "FTE" or if empTypeKey is already "1")
  if (getAllComponentType.employee_type_mapping[empTypeKey]) {
    return getAllComponentType.employee_type_mapping[empTypeKey];
  }

  return {};
};

// ---------------------------------------------------------------------------
// 1. Government ID Types
// ---------------------------------------------------------------------------
// Configured dynamically in the DB (syncDefaultConfigs.ts)

// ---------------------------------------------------------------------------
// 2. Public Helper Functions
// ---------------------------------------------------------------------------

/** Does this employee type support a Level field? */
export const hasLevel = (empTypeKey, getAllComponentType) => {
  const behavior = getMappedBehavior(getAllComponentType, empTypeKey);
  return !!behavior.hasLevel;
};

/** Does this employee type show Year of Study? */
export const hasYearOfStudy = (empTypeKey, getAllComponentType) => {
  const behavior = getMappedBehavior(getAllComponentType, empTypeKey);
  return !!behavior.hasYearOfStudy;
};


/**
 * Auto-calculates the salary API parameter tier for a given employee type based on its features.
 * "full"      → if it has Year of Study
 * "withLevel" → if it has Level
 * "basic"     → otherwise
 */
export const getSalaryParamTier = (empTypeKey, getAllComponentType) => {
  if (hasYearOfStudy(empTypeKey, getAllComponentType)) return "full";
  if (hasLevel(empTypeKey, getAllComponentType)) return "withLevel";
  return "basic";
};

/**
 * Returns whether the Level field should be disabled for this employee type
 * and department combination.
 */
export const isLevelDisabled = (empTypeKey, department, getAllComponentType) => {
  if (!empTypeKey) return false;
  if (!hasLevel(empTypeKey, getAllComponentType)) return true;
  
  // Check department mapping dynamically
  const deptMapping = getAllComponentType?.department_type_mapping || {};
  
  // Find actual department ID if a string name was passed
  const dropdown = getAllComponentType?.department_type_dropdown || {};
  const foundDeptKey = Object.keys(dropdown).find(
    key => String(dropdown[key]).trim().toLowerCase() === String(department).trim().toLowerCase()
  );
  
  const targetDeptKey = foundDeptKey || department;
  
  if (deptMapping[targetDeptKey]?.disablesLevel) {
    return true;
  }
  return false;
};

/**
 * Returns the Government ID dropdown options from DB.
 */
export const getGovIdOptions = (getAllComponentType) => {
  if (getAllComponentType?.government_id_type) {
    return Object.values(getAllComponentType.government_id_type).map((val) => ({
      value: val,
      label: val,
    }));
  }
  return [];
};
