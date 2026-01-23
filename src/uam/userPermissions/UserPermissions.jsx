import React from "react";
import { useState } from "react";
import { UserPermissionTable } from "./userPermissionTables/UserPermissionTable";
import { UserPermissionTableEdit } from "./userPermissionTables/UserPermissionTableEdit";

function UserPermissions() {
  const [showEdit, setShowEdit] = useState(false);

  const toggleOptions = () => {
    setShowEdit(!showEdit);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {showEdit === false ? (
        <UserPermissionTable isEdit={showEdit} toggleOptions={toggleOptions} />
      ) : (
        <UserPermissionTableEdit
          isEdit={showEdit}
          toggleOptions={toggleOptions}
        />
      )}
    </div>
  );
}

export default UserPermissions;
