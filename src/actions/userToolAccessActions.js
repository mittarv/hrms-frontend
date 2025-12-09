import axios from "axios";
export const fetchToolAccessForUser = async (userId, toolName) => {

    try {
          
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/toolpermission/tool/access`,
        {
          userId: userId,
          toolName: toolName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
      
      // dispatch({
      //   type : "RESET_HAVE_PERMISSION"
      // })
    } catch (error) {
      return error.response.data;
    }
  };
