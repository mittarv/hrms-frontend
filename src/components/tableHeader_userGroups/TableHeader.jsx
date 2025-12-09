
import './tableHeader.scss'
import { userGroupPageData } from '../../constant/data'
import { useDispatch, useSelector } from 'react-redux';
import {clearErrorData} from '../../actions/userGroupsActions'
export const TableHeader = (props) => {
    const { isEdit, toggleOptions, saveChanges } = props;

    const {rowError } = useSelector((state) => state.usergroup);
    const dispatch = useDispatch();

    return (
        <>
            <div className="main_table_header_div">
                {
                    isEdit === false ?
                        <div className="inner-div-left-section">
                            <p className='inner-div-left-title'>{userGroupPageData.heading}</p>
                            <p className='inner-div-left-subtitle'>{userGroupPageData.subHeading}</p>
                        </div>
                        :

                        <div className="inner-div-left-section">
                            <p className='inner-div-left-title'>{userGroupPageData.heading}</p>
                            <div className="inner-div-left-section-isEdit-suggestions">
                                {
                                    rowError === undefined ?
                                        <>
                                            <div className="suggestions-1">
                                                <span className="suggestion1-color"></span>
                                                <p className='inner-div-left-subtitle'>{userGroupPageData.subheadingSuggestion1}</p>
                                            </div>
                                            <div className="suggestions2">
                                                <span className="suggestion2-color"></span>
                                                <p className='inner-div-left-subtitle'>{userGroupPageData.subheadingSuggestion2}</p>

                                            </div>
                                        </>

                                        :
                                        <p className='error_message'>{rowError.message}</p>
                                }

                            </div>
                        </div>

                }

                <div className='inner-div-right-section'>
                    {
                        isEdit === false ?
                            <button className='edit_button' onClick={toggleOptions}>
                                Edit
                            </button>
                            :
                            <div>
                                <button className='save_button' onClick={saveChanges}>Save</button>
                                {/* <Button className='save-button' variant="contained" onClick={saveChanges}>
                                   
                                    Save
                                </Button> */}
                                <button className='cancel_button' onClick={() => {
                                    dispatch(clearErrorData())
                                    toggleOptions() 
                                    }}>Cancel</button>
                                {/* <Button className='cancel-button' variant="text" color="error" onClick={() => {toggleOptions() }}>
                                    Cancel
                                </Button> */}
                            </div>
                    }
                </div>
            </div>
        </>
    )
}