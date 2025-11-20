import { useState } from "react";
import UserGroupTable from "./userGroupTables/UserGroupTable";
import UserGroupTableEditable from "./userGroupTables/UserGroupTableEditable";

const UserGroups = () => {
  const [showEdit, setShowEdit] = useState(false);

  const toggleOptions = () => {
    setShowEdit(!showEdit);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        marginBottom: "2.5vh",
      }}
    >
      {showEdit === false ? (
        <UserGroupTable showEdit={showEdit} toggleOptions={toggleOptions} />
      ) : (
        <UserGroupTableEditable
          isEdit={showEdit}
          toggleOptions={toggleOptions}
        />
      )}
    </div>
  );
};

export default UserGroups;