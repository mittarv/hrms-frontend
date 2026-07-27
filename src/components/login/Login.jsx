import React from "react";
import loginImage from "../../assets/images/login_image.svg";
import mittarvLogo from "../../assets/images/mittarv_logo.svg";
import mittarvLogo2 from "../../assets/images/mittarv_logo_2.svg";
import "./Login.scss";
import "../../design/fonts/_CustomTextStyles.scss";
import { loginPageData } from "../../constant/data";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin } from "../../actions/userActions";
import Snackbar from "../../uam/hrRepository/Common/components/Snackbar";
import { getLoginHost } from "../../utils/domainUtils";

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  // If already authenticated, go to home
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/");
    }
  }, [isAuthenticated]);

  // Google OAuth only allows whitelisted origins (the central domain).
  // If the user is on a subdomain (e.g., hora4.lvh.me), redirect them to the central domain (lvh.me).
  React.useEffect(() => {
    const hostname = window.location.hostname;
    
    // Skip if localhost or IP address
    if (hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return;

    const loginHost = getLoginHost();
    const loginHostname = loginHost.split(":")[0];
    
    // If the user is on a subdomain, redirect them to the central login domain for Google OAuth.
    if (hostname !== loginHostname) {
      window.location.replace(`${window.location.protocol}//${loginHost}/login`);
    }
  }, []);

  const onSuccessHandler = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const onErrorHandler = () => {
    window.alert("Something went wrong");
  };

  return (
    <>
    <div className="main_login__div">
      <div className="login_left__section">
        <img src={mittarvLogo} alt="mittarv_logo" className="mittarv_logo" />
        <img src={loginImage} alt="logo" className="login_image" />
      </div>
      <div className="login_right__section">
        <img
          src={mittarvLogo2}
          alt="mittarv_logo"
          className="mittarv_second_logo"
        />
        <p className="login_into__para">{loginPageData.loginPageTitle}</p>
        <p className="toolbox_login__title">{loginPageData.toolboxTitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={onSuccessHandler}
            onError={onErrorHandler}
            text={loginPageData.googleLoginButton}
            className="google_login_btn"
            width={280}
            scope="profile email"
            logo_alignment="center"
            prompt="select_account"
          />
        </div>
      </div>
    </div>
    <Snackbar/>
    </>
  );
};

export default Login;
