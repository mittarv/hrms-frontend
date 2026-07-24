import { ToolHeaderdata } from "../../constant/data";
import "../../tools/toolHome/toolheader.scss";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import MittArv_logo from "../../assets/icons/mittarv_name_and_logo.svg";
import { logoutUser } from "../../actions/userActions";

const ToolHeader = () => {
  const { user } = useSelector((state) => state.user);
  const { organizationDetails } = useSelector((state) => state.hrRepositoryReducer || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoSrc = organizationDetails?.metadata?.logo || MittArv_logo;

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
  };
  return (
    <div className="home_header">
      <div className="home_header__left">
        <img src={logoSrc} alt="nav_logo" onClick={()=>navigate("/")} style={{ maxHeight: 40, objectFit: "contain", cursor: "pointer" }} />
      </div>
      <div className="home_header__right">
        <div className="user_name_div">
          <p>{user?.name}</p>
          {user?.employeeUuid ? (
            <Link to={`/dashboard?employeeUuid=${user.employeeUuid}&showEmployeeDetails=true`}>
              <img
                src={user?.profilePic || user?.avatar || user?.picture || MittArv_logo}
                alt="user_profile"
                style={{ width: 44, height: 44, borderRadius: "50%", marginLeft: "15px", objectFit: "cover" }}
              />
            </Link>
          ) : (
            <img
              src={user?.profilePic || user?.avatar || user?.picture || MittArv_logo}
              alt="user_profile"
              style={{ width: 44, height: 44, borderRadius: "50%", marginLeft: "15px", objectFit: "cover" }}
            />
          )}
        </div>

        <p onClick={(e) => handleLogout(e)}>{ToolHeaderdata.logout}</p>
      </div>
    </div>
  );
};

export default ToolHeader;
