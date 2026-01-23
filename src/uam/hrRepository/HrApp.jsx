import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import HRMSLayout from "./Common/HRMSLayout";
import Login from "../../components/login/Login";
import useHrmsDynamicTitle from "./hooks/useHrmsDynamicTitle";
import { loadUserInfo } from "../../actions/userActions";
import { getMyHrmsAccess } from "../../actions/hrRepositoryAction";

const HrApp = () => {
  const dispatch = useDispatch();

  useHrmsDynamicTitle();

  const { isAuthenticated, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(loadUserInfo());
    dispatch(getMyHrmsAccess());
  }, [dispatch]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      {isAuthenticated ? (
        <HRMSLayout isAuthenticated={isAuthenticated} />
      ) : (
        <Login />
      )}
    </>
  );
};

export default HrApp;
