import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Routes, Route } from "react-router-dom";

import "./App.scss";
import Login from "./components/login/Login";
import Layout from "./uam/uamHome/Layout";
import PrivateRoute from "./PrivateRoute";
import useDynamicTitle from "./hooks/useDynamicTitle";

import { loadUserInfo } from "./actions/userActions";

import ToolHome from "./tools/toolHome/ToolHome";


const basicRoutes = [
  { path: "/", element: <ToolHome /> },
];

const accessBasedRoutes = [];

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useDynamicTitle();

  const { isAuthenticated, loading } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(loadUserInfo());
  }, [dispatch]);

  const isHeaderlessRoute = useMemo(() => {
    const noHeaderPaths = [
      "/",
    ];
    return (
      noHeaderPaths.some((path) => location.pathname === path) 
    );
  }, [location.pathname]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      {isAuthenticated ? (
        isHeaderlessRoute ? (
          <Routes>
            {basicRoutes.map(({ path, element }) => (
              <Route
                key={path}
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path={path} element={element} />
              </Route>
            ))}

            {accessBasedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path={path} element={element} />
              </Route>
            ))}
          </Routes>
        ) : (
          <Layout isAuthenticated={isAuthenticated} />
        )
      ) : (
        <Login />
      )}
    </>
  );
};

export default App;
