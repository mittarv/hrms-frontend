import React, { useEffect } from "react";
import loginImage from "../../assets/images/login_image.svg";
import mittarvLogo from "../../assets/images/mittarv_logo.svg";
import mittarvLogo2 from "../../assets/images/mittarv_logo_2.svg";
import "./Login.scss";
import "../../design/fonts/_CustomTextStyles.scss";
import { loginPageData } from "../../constant/data";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin } from "../../actions/userActions";
import Snackbar from "../../uam/hrRepository/Common/components/Snackbar";

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse) => {
      dispatch(googleLogin(codeResponse.code));
    },
    onError: () => {
      window.alert("Something went wrong");
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/");
    }
  }, [isAuthenticated]);
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
        <button
          onClick={login}
          className="google_login_btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "280px",
            padding: "10px 16px",
            border: "1px solid #dadce0",
            borderRadius: "4px",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            color: "#3c4043",
            fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
          <Snackbar/>
          </>
  );
};

export default Login;
