import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import '../dashboard.scss';

const EmployeeChart = () => {
  const { allEmployees, getAllComponentType } = useSelector((state) => state.hrRepositoryReducer);
  
  // Get employee type mappings from getAllComponentType
  const getEmployeeTypeData = () => {
    if (!allEmployees || !getAllComponentType?.emp_type_dropdown) {
      return { categories: [], data: [], totalEmployees: 0 };
    }

    const empTypeDropdown = getAllComponentType.emp_type_dropdown;
    const categories = [];
    const data = [];
    
    // Count employees by job type
    Object.entries(empTypeDropdown).forEach(([key, label]) => {
      const count = allEmployees.filter(emp => emp.employeeJobType === key).length;
      categories.push(label);
      data.push(count);
    });

    const totalEmployees = allEmployees.length;
    
    return { categories, data, totalEmployees };
  };

  const { categories, data, totalEmployees } = getEmployeeTypeData();

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
      show: false 
    }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 10,
        borderRadiusApplication: 'end', 
        distributed: true,
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: '16px',
          fontWeight: 400,
        }
      }
    },
    yaxis: {
      min:0,
      max: Math.max(...data) + 5,
      tickAmount: 5, // 5 gaps (6 ticks: 0, 5, 10, 15, 20, 25)
      labels: {
        formatter: function (val) {
          return Math.round(val); // Show only whole numbers
        }
      }
    },
    fill: {
      opacity: 1
    },
    colors: ['#87C4DE', '#97A8E5', '#91E3E3', '#B8A6E2', '#FFB6C1', '#98FB98'],
    tooltip: {
      y: {
        formatter: function (val) {
          return val + ' employees'
        }
      }
    }
  };

  const chartSeries = [{
    name: 'Employees',
    data: data
  }];

  return (
    <div className='employee-chart-container'>
      <div className="employee-chart-header">
        <p className="employee-chart-title">
          Employees <span className='seperator'>|</span> {totalEmployees}
        </p>
      </div>
      <div className="employee-chart">
        <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </div>
    </div>
  );
}

export default EmployeeChart;