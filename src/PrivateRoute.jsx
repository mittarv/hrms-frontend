import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to={"/login"} replace={true}/>;
  } else {
    return <Outlet />;
  }
};

export default PrivateRoute;
