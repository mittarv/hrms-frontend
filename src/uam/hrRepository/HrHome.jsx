import { useEffect } from "react"
import Header from "../../components/header/Header"
import Sidebar from "../../components/sidebar/Sidebar"
import Dashboard from "./Dashboard/Dashboard"
import { useDispatch } from "react-redux"
import { toolHomePageData } from "../../constant/data"


const HrHome = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: toolHomePageData.toot_title2
    });
  }, [dispatch])

  return (
    <div className="parent_component">
    {/* =======================this sidebar and the Header will be fixed for every component ================================*/}
    <Sidebar />
    <div className="static_component">
      <Header />
      <div className="display_routes">
        <Dashboard />
      </div>
    </div>
  </div>
  )
}

export default HrHome