import { useEffect } from "react"
import Dashboard from "./Dashboard/Dashboard"
import { useDispatch } from "react-redux"
import { hrToolHomePageData } from "./constant/data"


const HrHome = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });
  }, [dispatch])

  return <Dashboard />
}

export default HrHome