import { mittarvToolsPageData } from "../../constant/data";
import { useDispatch, useSelector } from "react-redux";
import { clearTempandErrorData } from "../../actions/mittarvToolsActions";

const PolicyTableHeader = ({ isEdit, toggleOptions, saveChanges }) => {
  const { toolwitherror } = useSelector((state) => state.mittarvtools);
  const { user, allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();

  return (
    <>
      <div className="main_table_header_div">
        {isEdit === false ? (
          <div className="inner-div-left-section">
            <p className="inner-div-left-title">Welcome, {user?.name}</p>
            <p className="inner-div-left-subtitle-2">
              Here you can see the policies available to you
            </p>
            <h1 className="policy_heading">Policies</h1>
          </div>
        ) : (
          <div className="inner-div-left-section">
            <p className="inner-div-left-title">Edit The Policies</p>
            <div className="inner-div-left-section-isEdit-suggestions">
              {toolwitherror?.error !== true ? (
                <>
                  <div className="suggestions-1">
                    <span className="suggestion1-color"></span>
                    <p className="inner-div-left-subtitle">
                      {mittarvToolsPageData.subheadingSuggestion1}
                    </p>
                  </div>
                  <div className="suggestions2">
                    <span className="suggestion2-color"></span>
                    <p className="inner-div-left-subtitle">
                      {mittarvToolsPageData.subheadingSuggestion2}
                    </p>
                  </div>
                </>
              ) : (
                <p className="error_message">{toolwitherror?.message}</p>
              )}
            </div>
          </div>
        )}

        {allToolsAccessDetails?.[selectedToolName] >= 500 && (
          <div className="inner-div-right-section">
            {isEdit === false ? (
              <button className="edit_button" onClick={toggleOptions}>
                Edit
              </button>
            ) : (
              <div>
                <button className="save_button" onClick={saveChanges}>
                  Save
                </button>

                <button
                  className="cancel_button"
                  onClick={() => {
                    dispatch(clearTempandErrorData);
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
