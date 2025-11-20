import { useState } from "react";
import MittarvToolsTable from "./mittarvToolsTables/MittarvToolsTable";
import MittarvToolsTableEdit from "./mittarvToolsTables/MittarvToolsTableEdit";

function MittArvTools() {
  const [showEdit, setShowEdit] = useState(false);
  const toggleOptions = () => {
    setShowEdit(!showEdit);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {showEdit === false ? (
        <MittarvToolsTable isEdit={showEdit} toggleOptions={toggleOptions} />
      ) : (
        <MittarvToolsTableEdit
          isEdit={showEdit}
          toggleOptions={toggleOptions}
        />
      )}
    </div>
  );
}

export default MittArvTools;

