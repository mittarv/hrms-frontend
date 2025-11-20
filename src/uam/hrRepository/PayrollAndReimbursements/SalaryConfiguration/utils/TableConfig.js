import store from "../../../../../store";

/**
 * Simplified Table Configuration
 * Contains all table column definitions and frequency management
 */

// Column Types
export const COLUMN_TYPES = {
  TEXT: "text",
  NUMBER: "number", 
  CHECKBOX: "checkbox",
  DATE: "date",
  SELECT: "select",
  ACTIONS: "actions"
};

// Component Types
export const COMPONENT_TYPES = {
  DEFAULT_ADDITION: "defaultAddition",
  DEFAULT_DEDUCTION: "defaultDeduction", 
  ADDITION: "addition",
  DEDUCTION: "deduction"
};

/**
 * Frequency Management
 */
export class FrequencyManager {
  static getFrequencyMapping() {
    const state = store.getState().hrRepositoryReducer;
    return state.getAllComponentType?.leave_accural_frequency || {};
  }

  static getFrequencyDisplayValue(frequencyKey) {
    const frequencyMapping = this.getFrequencyMapping();
    return frequencyMapping[frequencyKey]?.[0] || frequencyKey;
  }

  static getFrequencyKey(displayValue) {
    const frequencyMapping = this.getFrequencyMapping();
    
    for (const [key, value] of Object.entries(frequencyMapping)) {
      if (value[0] === displayValue) {
        return key;
      }
    }
    return displayValue;
  }

  static getFrequencyOptions() {
    const frequencyMapping = this.getFrequencyMapping();
    
    if (Object.keys(frequencyMapping).length > 0) {
      return Object.values(frequencyMapping).map(option => option[0]);
    }
    
    // Fallback options
    return ["Monthly", "Quarterly", "Half Yearly", "Yearly", "One Time"];
  }
}

/**
 * Column Configuration Factory
 */
export class ColumnConfigFactory {
  static createBaseColumn(key, label, type, required = false, options = []) {
    return {
      key,
      label,
      type,
      required,
      ...(options.length > 0 && { options })
    };
  }

  static getAdditionDeductionColumns() {
    return [
      this.createBaseColumn("componentName", "Component Name", COLUMN_TYPES.TEXT, true),
      this.createBaseColumn("isVariable", "Variable", COLUMN_TYPES.CHECKBOX, false),
      this.createBaseColumn("amount", "Amount", COLUMN_TYPES.NUMBER, true),
      this.createBaseColumn("thresholdAmount", "Threshold Amount", COLUMN_TYPES.NUMBER, false),
      this.createBaseColumn("effectiveFrom", "Effective From", COLUMN_TYPES.DATE, false),
      this.createBaseColumn("frequency", "Frequency", COLUMN_TYPES.SELECT, false, FrequencyManager.getFrequencyOptions()),
      this.createBaseColumn("action", "Action", COLUMN_TYPES.ACTIONS, false)
    ];
  }

  static getDefaultAdditionColumns() {
    return [
      this.createBaseColumn("componentName", "Component Name", COLUMN_TYPES.TEXT, true),
      this.createBaseColumn("includeinLop", "Included in LOP", COLUMN_TYPES.CHECKBOX, false),
      this.createBaseColumn("amount", "Amount", COLUMN_TYPES.NUMBER, true),
      this.createBaseColumn("percentageOfBasicSalary", "Percentage (Basic Salary)", COLUMN_TYPES.NUMBER, false),
      this.createBaseColumn("action", "Action", COLUMN_TYPES.ACTIONS, false)
    ];
  }

  static getDefaultDeductionColumns() {
    return [
      this.createBaseColumn("componentName", "Component Name", COLUMN_TYPES.TEXT, true),
      this.createBaseColumn("amount", "Amount", COLUMN_TYPES.NUMBER, true),
      this.createBaseColumn("action", "Action", COLUMN_TYPES.ACTIONS, false)
    ];
  }
}

/**
 * Default Row Data - Empty since default data comes from backend
 */
export const DEFAULT_ROWS = [];

// Backward compatibility exports
export const getFrequencyDisplayValue = FrequencyManager.getFrequencyDisplayValue.bind(FrequencyManager);
export const getFrequencyKey = FrequencyManager.getFrequencyKey.bind(FrequencyManager);
export const getFrequencyOptions = FrequencyManager.getFrequencyOptions.bind(FrequencyManager);
export const getAdditionDeductionColumns = ColumnConfigFactory.getAdditionDeductionColumns.bind(ColumnConfigFactory);
export const defaultAdditionColumns = ColumnConfigFactory.getDefaultAdditionColumns();
export const defaultDeductionColumns = ColumnConfigFactory.getDefaultDeductionColumns();
export const defaultRows = DEFAULT_ROWS;
