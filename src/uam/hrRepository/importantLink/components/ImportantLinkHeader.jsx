import { useDispatch, useSelector } from "react-redux";
import { hrRepositoryTableHeaderData } from "../../constant/data";
import { clearStateDataLink } from "../../../../actions/hrRepositoryAction";
import "../styles/importantLinkTable.scss";
import "../styles/ImportantLinkTableHeader.scss";


const ImportantLinkHeader = ({ isEdit, toggleOptions, saveChanges }) => {
  const { toolwitherror, selectedToolName } = useSelector((state) => state.mittarvtools);
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const dispatch = useDispatch();


  return (
    <>
      <div className="important_link_main_table_header_div">
        {isEdit === false ? (
          <div className="important_link_inner_div_left_section">
            <p className="important_link_inner_div_left_title">Welcome, {user?.name}</p>
            <p className="important_link_inner_div_left_subtitle">
              Here you can see the links to the tools available to you
            </p>
          </div>
        ) : (
          <div className="important_link_inner_div_left_section">
            <p className="important_link_inner_div_left_title">Edit The Links</p>
            <div className="important_link_inner_div_left_section_edit_suggestions">
              {toolwitherror?.error !== true ? (
                <>
                  <div className="important_link_suggestions_1">
                    <span className="important_link_suggestion1_color"></span>
                    <p className="important_link_inner_div_left_subtitle">
                      {hrRepositoryTableHeaderData.subheadingSuggestion1}
                    </p>
                  </div>
                  <div className="important_link_suggestions_2">
                    <span className="important_link_suggestion2_color"></span>
                    <p className="important_link_inner_div_left_subtitle">
                      {hrRepositoryTableHeaderData.subheadingSuggestion2}
                    </p>
                  </div>
                </>
              ) : (
                <p className="important_link_error_message">{toolwitherror?.message}</p>
              )}
            </div>
          </div>
        )}
        {(allToolsAccessDetails?.[selectedToolName] >= 900 || 
          myHrmsAccess?.permissions?.some(perm => 
            perm.name === "ImportantLink_create" || 
            perm.name === "ImportantLink_update" || 
            perm.name === "ImportantLink_write"
          )) && (
          <div className="important_link_inner_div_right_section">
            {isEdit === false ? (
              <button className="important_link_edit_button" onClick={toggleOptions}>
                Edit
              </button>
            ) : (
              <div>
                <button className="important_link_save_button" onClick={saveChanges}>
                  Save
                </button>

                <button
                  className="important_link_cancel_button"
                  onClick={() => {
                    dispatch(clearStateDataLink());
                    toggleOptions();
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ImportantLinkHeader;
