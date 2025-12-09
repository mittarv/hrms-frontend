import "./tableHeader.scss";
import { mittarvToolsPageData } from "../../constant/data";
import { useDispatch, useSelector } from "react-redux";
import { clearTempandErrorData } from "../../actions/mittarvToolsActions";

export const TableHeader = (props) => {
  const { isEdit, toggleOptions, saveChanges } = props;
  const { toolwitherror } = useSelector((state) => state.mittarvtools);
  const dispatch = useDispatch();

  return (
    <>
      <div className="main_table_header_div">
        {isEdit === false ? (
          <div className="inner-div-left-section">
            <p className="inner-div-left-title">
              {mittarvToolsPageData.heading}
            </p>
            <p className="inner-div-left-subtitle">
              {mittarvToolsPageData.subHeading}
            </p>
          </div>
        ) : (
          <div className="inner-div-left-section">
            <p className="inner-div-left-title">
              {mittarvToolsPageData.heading}
            </p>
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
                  <div className="suggestions3">
                    <strike className="suggestion3">ABC</strike>
                    <p className="inner-div-left-subtitle">
                      {"Represenrts deleted text"}
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
              {/* <Button className='save-button' variant="contained" onClick={saveChanges}>
                                   
                                    Save
                                </Button> */}
              <button
                className="cancel_button"
                onClick={() => {
                  dispatch(clearTempandErrorData);
                  toggleOptions();
                }}
              >
                Cancel
              </button>
              {/* <Button className='cancel-button' variant="text" color="error" onClick={() => {toggleOptions() }}>
                                    Cancel
                                </Button> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
