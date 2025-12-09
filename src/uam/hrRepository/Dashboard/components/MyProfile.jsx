import '../dashboard.scss';
import { useDispatch } from 'react-redux';
import { getCurrentEmployeeDetails, getAllCountriesDetails} from '../../../../actions/hrRepositoryAction';
import { useSelector } from 'react-redux';
import Mittarv_logo from '../../../../assets/images/mittarv_logo_dark.svg'
import { useSearchParams } from 'react-router-dom';

const MyProfile = ({currentEmployeeDetails, getAllManagersDetails}) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const manager = getAllManagersDetails?.find(manager => manager.empUuid === currentEmployeeDetails?.employeeCurrentJobDetails?.empManager);
    const [searchParams, setSearchParams] = useSearchParams();
    const employeeId = searchParams.get('employeeUuid') || user.employeeUuid;
    const ManagerName = manager ? `${manager.empFirstName} ${manager.empLastName}` : '';
    const hrRepositoryReducer = useSelector((state) => state?.hrRepositoryReducer);
    const getAllComponentType = hrRepositoryReducer?.getAllComponentType ?? {};
    const HiringDate = currentEmployeeDetails?.employeeBasicDetails?.empHireDate;
    const formattedHiringDate = new Date(HiringDate).toLocaleDateString('en-GB');


    const handleViewProfile = () => {
        dispatch(getCurrentEmployeeDetails(user.employeeUuid));
        dispatch(getAllCountriesDetails());
        setSearchParams((prev) => {
            prev.set("showEmployeeDetails", "true");
            prev.set("employeeUuid", employeeId);
            return prev;
        });
    };

    const getCurrentEmployeeLevel = (empLevel) => {
        const currentLevel = getAllComponentType?.level_dropdown && getAllComponentType?.level_dropdown[
            empLevel
          ] || currentEmployeeDetails?.employeeCurrentJobDetails?.empLevel;
        return currentLevel;
    }
    
  return (
    <>
      <div className="dashboard-container">
            <div className='profile-image-container'>
                <div className='profile-container'>
                    <img src={currentEmployeeDetails?.employeeProfileImage || Mittarv_logo} className="profile-image" referrerPolicy="no-referrer"/>
                </div>
                <div className='btn-container'>
                    <button 
                    className="profile-view-button" 
                    onClick={handleViewProfile}
                    >View Profile</button>
                </div>
            </div>
            <div className='user-information-container'>
                <div className='user-name-container'>
                    <p className='user-labels'>Email:</p>
                    <p className='user-details'>{currentEmployeeDetails?.employeeContactDetails?.empOfficialEmail ?? "---"}</p>
                </div>
                <div className='user-email-container'>
                    <p className='user-labels'>Level:</p>
                    <p className='user-details'>{getCurrentEmployeeLevel(currentEmployeeDetails?.employeeCurrentJobDetails?.empLevel) || "---"}</p>
                </div>
                <div className='user-role-container'>
                    <p className='user-labels'>Reporting Manager:</p>
                    <p className='user-details'>{ManagerName || "---"}</p>
                </div>
                <div className='user-role-container'>
                    <p className='user-labels'>Employee ID:</p>
                    <p className='user-details'>{currentEmployeeDetails?.employeeBasicDetails?.empCompanyId || "---"}</p>
                </div>
                <div className='user-role-container'>
                    <p className='user-labels'>Hire Date:</p>
                    <p className='user-details'>{formattedHiringDate || "---"}</p>
                </div>
            </div> 
      </div>
    </>
  )
}

export default MyProfile;
