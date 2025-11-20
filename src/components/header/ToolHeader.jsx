import { ToolHeaderdata } from "../../constant/data";
import "../../tools/toolHome/toolheader.scss";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import MittArv_logo from "../../assets/icons/mittarv_name_and_logo.svg"
const ToolHeader = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: "LOGOUT_USER" });
  };
  return (
    <div className="home_header">
      <div className="home_header__left">
        <img src={MittArv_logo} alt="nav_logo" onClick={()=>navigate("/")} />
      </div>
      <div className="home_header__right">
        <div className="user_name_div">
          <p>{user?.name}</p>
          {user?.employeeUuid ? (
          <Link to={`/dashboard?employeeUuid=${user.employeeUuid}&showEmployeeDetails=true`}>
            <img src={user?.profilePic} alt="" style={{ width: 44, height: 44, borderRadius:"50%", marginLeft: "15px" }} />
          </Link>
          ) : (
            <img src={user?.profilePic} alt="" style={{ width: 44, height: 44, borderRadius:"50%", marginLeft: "15px" }} />
          )}     
          
        </div>

        <p onClick={(e) => handleLogout(e)}>{ToolHeaderdata.logout}</p>
      </div>
    </div>
  );
};

export default ToolHeader;
