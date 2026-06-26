import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import HRMSLayout from "./Common/HRMSLayout";
import Login from "../../components/login/Login";
import useHrmsDynamicTitle from "./hooks/useHrmsDynamicTitle";
import { loadUserInfo } from "../../actions/userActions";

const HrApp = () => {
  const dispatch = useDispatch();

  useHrmsDynamicTitle();

  const { isAuthenticated, loading, user } = useSelector((state) => state.user);

  useEffect(() => {
    // Only load user info if not already authenticated/loaded
    if (!isAuthenticated && !user) {
      dispatch(loadUserInfo());
    }
  }, [dispatch, isAuthenticated, user]);

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
