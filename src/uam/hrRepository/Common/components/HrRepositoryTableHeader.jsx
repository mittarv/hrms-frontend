import "./HrRepositoryTableHeader.scss";
import { hrRepoScreenPageData } from "../../constant/data";
import { useDispatch, useSelector } from "react-redux";
import { clearTempandErrorData } from "../../../../actions/mittarvToolsActions";

export const HrRepositoryTableHeader = (props) => {
  const { isEdit, toggleOptions, saveChanges } = props;
  const { toolwitherror } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();

  return (
    <>
      <div className="main_table_header_div">
        {isEdit === false ? (
          <div className="inner-div-left-section">
            <p className="inner-div-left-title">
              {hrRepoScreenPageData.heading}
            </p>
            <p className="inner-div-left-subtitle">
              {hrRepoScreenPageData.subHeading}
            </p>
          </div>
        ) : (
          <div className="inner-div-left-section">
            <p className="inner-div-left-title">
              {hrRepoScreenPageData.heading}
            </p>
            <div className="inner-div-left-section-isEdit-suggestions">
              {toolwitherror?.error !== true ? (
                <>
                  <div className="suggestions-1">
                    <span className="suggestion1-color"></span>
                    <p className="inner-div-left-subtitle">
                      {hrRepoScreenPageData.subheadingSuggestion1}
                    </p>
                  </div>
                  <div className="suggestions2">
                    <span className="suggestion2-color"></span>
                    <p className="inner-div-left-subtitle">
                      {hrRepoScreenPageData.subheadingSuggestion2}
                    </p>
                  </div>
                </>
              ) : (
                <p className="error_message">{toolwitherror?.message}</p>
              )}
            </div>
          </div>
        )}

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
      </div>
    </>
  );
};
