import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
// import MittarvToolsTable from "../mittarvTools/mittarvToolsTables/MittarvToolsTable";
// import MittarvToolsTableEdit from "../mittarvTools/mittarvToolsTables/MittarvToolsTableEdit";
import PolicyTable from "../../components/hrRepositoryTables/PolicyTable";
import PolicyEditTable from "../../components/hrRepositoryTables/PolicyEditTable";
import { useDispatch } from "react-redux";
import { toolHomePageData } from "../../constant/data";
// import PolicyEditTable from "../../components/hrRepositoryTables/PolicyEditTable";

const PolicyPage = () => {
  const dispatch = useDispatch();
  const [showEdit , setShowEdit] = useState(false);

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: toolHomePageData.toot_title2
    });
  }, [dispatch])
    const toggleOptions = ()=>{
        setShowEdit(!showEdit)
    }
  return (
    <div className="parent_component">
      {/* =======================this sidebar and the Header will be fixed for every component ================================*/}
      <Sidebar />
      <div className="static_component">
        <Header />
        <div className="display_routes">
          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
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
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
