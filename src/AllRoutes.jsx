import { Routes, Route } from "react-router-dom";

import Login from "./components/login/Login";
import PrivateRoute from "./PrivateRoute";

import UserGroups from "./uam/userGroups/userGroups";
import MyTools from "./uam/myTools/MyTools";
import UserPermissions from "./uam/userPermissions/UserPermissions";
import MittArvTools from "./uam/mittarvTools/MittarvTools";
import PendingRequests from "./uam/pendingRequests/PendingRequests";

const AllRoutes = ({ isAuthenticated }) => {

  const baseRoutes = [
    { path: "/login", element: <Login />, isPublic: true },
    { path: "/user-groups", element: <UserGroups /> },
    { path: "/user-permissions", element: <UserPermissions /> },
    { path: "/my-tools", element: <MyTools /> },
    { path: "/mittarv-tools", element: <MittArvTools /> },
    { path: "/pending-requests", element: <PendingRequests /> },
  ];

  const conditionalRoutes = [
  ];

  return (
    <Routes>
      {baseRoutes.map(({ path, element, isPublic }) =>
        isPublic ? (
          <Route key={path} path={path} element={element} />
        ) : (
          <Route
            key={path}
            element={<PrivateRoute isAuthenticated={isAuthenticated} />}
          >
            <Route path={path} element={element} />
          </Route>
        )
      )}

      {conditionalRoutes
        .filter(({ condition }) => condition)
        .map(({ path, element }) => (
          <Route
            key={path}
            element={<PrivateRoute isAuthenticated={isAuthenticated} />}
          >
            <Route path={path} element={element} />
          </Route>
        ))}
    </Routes>
  );
};

export default AllRoutes;
