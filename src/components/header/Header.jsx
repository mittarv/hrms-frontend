import { useState } from "react";
import { useSelector } from "react-redux";
// import { role } from "../../constant/data";
import "./header.scss";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import mittArvLogo from "../../assets/images/mittarv_logo_dark.svg";
import { valueRoleMap } from "../../constant/data";
// import { role } from "../../constant/data";

const Header = () => {
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { organizationDetails } = useSelector((state) => state.hrRepositoryReducer || {});
  const [logoError, setLogoError] = useState(false);

  const rawLogo = organizationDetails?.metadata?.logo || organizationDetails?.logo;
  const logoSrc = (!logoError && rawLogo && typeof rawLogo === "string" && rawLogo.trim()) ? rawLogo : mittArvLogo;

  return (
    <div className="uam_main__header">
      <div className="uam_main__header_left">
        <img src={logoSrc} alt="logo" style={{ maxHeight: "36px", objectFit: "contain" }} onError={() => setLogoError(true)} />
        <p>
          HRMS
        </p>
      </div>
      <div className="uam_main__header__right">
        <div className="user_role__div">
          <p>{user.name}</p>
          <p>{valueRoleMap?.[allToolsAccessDetails?.[selectedToolName]]}</p>
        </div>
        {user?.employeeUuid ? (
          <Link to={`/dashboard?employeeUuid=${user.employeeUuid}&showEmployeeDetails=true`}>
            <Avatar src={user.profilePic} />
          </Link>
        ) : (
          <Avatar src={user.profilePic} style={{ opacity: 0.5, pointerEvents: 'none' }} title="Profile unavailable" />
        )}
      </div>
    </div>
  );
};

export default Header;
