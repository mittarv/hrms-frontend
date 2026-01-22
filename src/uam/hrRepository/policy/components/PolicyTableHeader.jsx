import { hrRepositoryTableHeaderData } from "../../constant/data";
import { useDispatch, useSelector } from "react-redux";
import { clearStateData } from "../../../../actions/hrRepositoryAction";
import "../styles/PolicyTableHeader.scss";

const PolicyTableHeader = ({ isEdit, toggleOptions, saveChanges }) => {
  const { toolwitherror } = useSelector((state) => state.mittarvtools);
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const { myHrmsAccess } = useSelector((state) => state.hrRepositoryReducer);
  const dispatch = useDispatch();

  return (
    <>
      <div className="policy_main_table_header_div">
        {isEdit === false ? (
          <div className="policy_inner_div_left_section">
            <p className="policy_inner_div_left_title">Welcome, {user?.name}</p>
            <p className="policy_inner_div_left_subtitle">
              Here you can see the policies available to you
            </p>
            <h1 className="policy_heading">Policies</h1>
          </div>
        ) : (
          <div className="policy_inner_div_left_section">
            <p className="policy_inner_div_left_title">Edit The Policies</p>
            <div className="policy_inner_div_left_section_edit_suggestions">
              {toolwitherror?.error !== true ? (
                <>
                  <div className="policy_suggestions_1">
                    <span className="policy_suggestion1_color"></span>
                    <p className="policy_inner_div_left_subtitle">
                      {hrRepositoryTableHeaderData.subheadingSuggestion1}
                    </p>
                  </div>
                  <div className="policy_suggestions_2">
                    <span className="policy_suggestion2_color"></span>
                    <p className="policy_inner_div_left_subtitle">
                      {hrRepositoryTableHeaderData.subheadingSuggestion2}
                    </p>
                  </div>
                </>
              ) : (
                <p className="policy_error_message">{toolwitherror?.message}</p>
              )}
            </div>
          </div>
        )}

        {(allToolsAccessDetails?.[selectedToolName] >= 900 || 
          myHrmsAccess?.permissions?.some(perm => 
            perm.name === "Policy_create" || 
            perm.name === "Policy_update" || 
            perm.name === "Policy_write"
          )) && (
          <div className="policy_inner_div_right_section">
            {isEdit === false ? (
              <button className="policy_edit_button" onClick={toggleOptions}>
                Edit
              </button>
            ) : (
              <div>
                <button className="policy_save_button" onClick={saveChanges}>
                  Save
                </button>

                <button
                  className="policy_cancel_button"
                  onClick={() => {
                    dispatch(clearStateData());
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

export default PolicyTableHeader;
