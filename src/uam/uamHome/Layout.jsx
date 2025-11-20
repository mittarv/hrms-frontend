import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import AllRoutes from "../../AllRoutes";
import "./uamhome.scss";
import { useLocation } from "react-router-dom";

const Layout = ({ isAuthenticated }) => {
  const location = useLocation();
  return (
    <div className="parent_component">
      {/* =======================this sidebar and the Header will be fixed for every component ================================*/}
      {location.pathname === "/asset-vault-forms" ? <></> : <Sidebar />}
      <div className="static_component">
        <Header />
        <div className="display_routes">
          <AllRoutes isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
