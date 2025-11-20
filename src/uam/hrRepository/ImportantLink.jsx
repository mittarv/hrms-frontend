import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import ImportantLinkTable from "../../components/hrRepositoryTables/ImportantLinkTable";
import ImportantEditTable from "../../components/hrRepositoryTables/ImportantEditTable";
import { useDispatch } from "react-redux";
import { toolHomePageData } from "../../constant/data";

const ImportantLink = () => {
  const dispatch = useDispatch();
  const [showEdit, setShowEdit] = useState(false);
  const toggleOptions = () => {
    setShowEdit(!showEdit);
  };

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
          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            {showEdit === false ? (
              <ImportantLinkTable
                isEdit={showEdit}
                toggleOptions={toggleOptions}
              />
            ) : (
              <ImportantEditTable
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

export default ImportantLink;
