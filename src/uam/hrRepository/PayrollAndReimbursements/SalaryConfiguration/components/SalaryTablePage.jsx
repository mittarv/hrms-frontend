import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import DynamicTable from "./DynamicTable";
import { 
  ColumnConfigFactory,
  DEFAULT_ROWS,
  COMPONENT_TYPES
} from "../utils/TableConfig";
import LoadingSpinner from "../../../Common/components/LoadingSpinner";

/**
 * Simplified Salary Tables Page Component
 * Manages the display of all salary configuration tables
 */
export default function SalaryTablesPage() {
  const { 
    defaultComponents, 
    showDefaultTables, 
    getAllComponentType,
    selectedDropdownOptions,
    globalComponents,
    salaryConfigLoading,
  } = useSelector((state) => state.hrRepositoryReducer);
  
  const [tableColumns, setTableColumns] = useState({
    addition: [],
    deduction: []
  });

  // Update columns when store data changes
  useEffect(() => {
    const updatedColumns = {
      addition: ColumnConfigFactory.getAdditionDeductionColumns(),
      deduction: ColumnConfigFactory.getAdditionDeductionColumns()
    };
    
    setTableColumns(updatedColumns);
  }, [getAllComponentType?.leave_accural_frequency]);

  // Prepare table data
  const tableData = prepareTableData(defaultComponents, globalComponents);
  const categoryDetails = prepareCategoryDetails(selectedDropdownOptions);

  return (
      salaryConfigLoading ? <LoadingSpinner message="Loading Salary Configuration.."/> : <div className="salary-tables-container">
      {showDefaultTables && (
        <TableSection
          title="Default Addition"
          columns={ColumnConfigFactory.getDefaultAdditionColumns()}
          defaultRows={tableData.defaultAdditionRows}
          apiRows={tableData.defaultAdditionData}
          tableType={COMPONENT_TYPES.DEFAULT_ADDITION}
          categoryDetails={categoryDetails}
          isDisabled={false}
        />
      )}
      
      <TableSection
        title="Addition"
        columns={tableColumns.addition}
        defaultRows={[]}
        apiRows={tableData.globalAdditionData}
        tableType={COMPONENT_TYPES.ADDITION}
        categoryDetails={null}
        isDisabled={showDefaultTables}
      />
      
      {showDefaultTables && (
        <TableSection
          title="Default Deduction"
          columns={ColumnConfigFactory.getDefaultDeductionColumns()}
          defaultRows={tableData.defaultDeductionRows}
          apiRows={tableData.defaultDeductionData}
          tableType={COMPONENT_TYPES.DEFAULT_DEDUCTION}
          categoryDetails={categoryDetails}
          isDisabled={false}
        />
      )}
      
      <TableSection
        title="Deduction"
        columns={tableColumns.deduction}
        defaultRows={[]}
        apiRows={tableData.globalDeductionData}
        tableType={COMPONENT_TYPES.DEDUCTION}
        categoryDetails={null}
        isDisabled={showDefaultTables}
      />
    </div>
  );
}

/**
 * Individual Table Section Component
 */
const TableSection = ({ 
  title, 
  columns, 
  defaultRows, 
  apiRows, 
  tableType, 
  categoryDetails, 
  isDisabled 
}) => (
  <DynamicTable
    title={title}
    columns={columns}
    defaultRows={defaultRows}
    apiRows={apiRows}
    isDisabled={isDisabled}
    tableType={tableType}
    categoryDetails={categoryDetails}
  />
);

/**
 * Utility Functions
 */
const prepareTableData = (defaultComponents, globalComponents) => {
  const filterByType = (components, type) => 
    components.filter(component => component.componentType === type)
              .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

  return {
    defaultAdditionData: filterByType(defaultComponents, COMPONENT_TYPES.DEFAULT_ADDITION),
    defaultDeductionData: filterByType(defaultComponents, COMPONENT_TYPES.DEFAULT_DEDUCTION),
    defaultAdditionRows: filterByType(DEFAULT_ROWS, COMPONENT_TYPES.DEFAULT_ADDITION),
    defaultDeductionRows: filterByType(DEFAULT_ROWS, COMPONENT_TYPES.DEFAULT_DEDUCTION),
    globalAdditionData: filterByType(globalComponents, COMPONENT_TYPES.ADDITION),
    globalDeductionData: filterByType(globalComponents, COMPONENT_TYPES.DEDUCTION)
  };
};

const prepareCategoryDetails = (selectedDropdownOptions) => {
  if (!selectedDropdownOptions) return null;
  
  return {
    employeeType: selectedDropdownOptions.employeeType,
    employeeLocation: selectedDropdownOptions.employeeLocation,
    employeeLevel: selectedDropdownOptions.employeeLevel
  };
};
