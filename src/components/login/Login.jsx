import React, { useEffect } from "react";
import loginImage from "../../assets/images/login_image.svg";
import mittarvLogo from "../../assets/images/mittarv_logo.svg";
import mittarvLogo2 from "../../assets/images/mittarv_logo_2.svg";
import "./Login.scss";
import "../../design/fonts/_CustomTextStyles.scss";
import { loginPageData } from "../../constant/data";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin } from "../../actions/userActions";

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  const onSuccessHandler = (credentialResponse) => {
    console.log("Login Success");
    const decoded = jwtDecode(credentialResponse.credential);
    dispatch(googleLogin(decoded.email, decoded.name, decoded.picture));
  };
  const onErrorHandler = (error) => {
    console.log("Error occured in Login ");
    window.alert("Something went wrong");
  };
  

  //in this useEffect we are checking if user is authenticated or not, if user is authenticated then we are redirecting user to home page
  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/");
    }
  }, [isAuthenticated]);
  return (
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
        <GoogleLogin
          onSuccess={onSuccessHandler}
          onError={onErrorHandler}
          text={loginPageData.googleLoginButton}
          className="google_login_btn"
          width={280}
          scope="profile email"
          logo_alignment="center"
        />
      </div>
    </div>
  );
};

export default Login;
