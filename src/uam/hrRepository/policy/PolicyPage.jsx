import { useEffect, useState } from "react";
import PolicyTable from "./components/PolicyTable";
import PolicyEditTable from "./components/PolicyEditTable";
import { useDispatch } from "react-redux";
import { hrToolHomePageData } from "../constant/data";

const PolicyPage = () => {
  const dispatch = useDispatch();
  const [showEdit , setShowEdit] = useState(false);

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });
  }, [dispatch])
    const toggleOptions = ()=>{
        setShowEdit(!showEdit)
    }
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {showEdit === false ? (
        <PolicyTable
          isEdit={showEdit}
          toggleOptions={toggleOptions}
        />
      ) : (
        <PolicyEditTable
          isEdit={showEdit}
          toggleOptions={toggleOptions}
        />
      )}
    </div>
  );
};

export default PolicyPage;
