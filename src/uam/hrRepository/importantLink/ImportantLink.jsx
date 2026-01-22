import { useEffect, useState } from "react";
import ImportantLinkTable from "./components/ImportantLinkTable";
import ImportantEditTable from "./components/ImportantEditTable";
import { useDispatch } from "react-redux";
import { hrToolHomePageData } from "../constant/data";

const ImportantLink = () => {
  const dispatch = useDispatch();
  const [showEdit, setShowEdit] = useState(false);
  const toggleOptions = () => {
    setShowEdit(!showEdit);
  };

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2
    });
  }, [dispatch])
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
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
  );
};

export default ImportantLink;
