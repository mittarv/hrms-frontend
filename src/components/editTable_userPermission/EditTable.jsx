import './editTable.scss'
import {userPermissionsData} from '../../constant/data'
import { useSelector } from 'react-redux';

export const EditTable = (props) => {
    const { isEdit ,toggleOptions , saveChanges } = props;
    
    // those loading values will be used to show the Saving text on the button
    const {adduserloading,updateuserloading,deluserloading} = useSelector((state) => state.userpermissions)

    



    return (
        <>
            <div className="main_table_header_div">
                {
                    isEdit === false ? 
                    <div className="inner_div_left_section">
                    <p className='inner_div_left_title'>{userPermissionsData.heading}</p>
                    <p className='inner_div_left_subtitle'>{userPermissionsData.subHeading}</p>
                </div>
                :
                <div className="inner_div_left_section">
                    <p className='inner_div_left_title'>{userPermissionsData.heading}</p>
                    <div className="inner_div_left_section_isEdit_suggestions">
                        <div className="suggestions_1">
                            <span className="suggestion1_color"></span>
                            <p className='inner_div_left_subtitle'>{userPermissionsData.subheadingSuggestion1} </p>
                        </div>
                        <div className="suggestions2">
                            <span className="suggestion2_color"></span>
                            <p className='inner_div_left_subtitle'>{userPermissionsData.subheadingSuggestion2}</p>

                        </div>
                    </div>
                </div>
                }
                 
                <div className='inner_div_right_section'>
                    {
                        isEdit === false ?
                        <button className='edit_button' onClick={toggleOptions}>
                            Edit
                        </button>
                        :
                        <div>
                            <button className="save_button" onClick={saveChanges}> {(adduserloading === true || updateuserloading === true || deluserloading === true) ? "Saving.." :"Save"}</button>

                            <button className="cancel_button" onClick={toggleOptions}>Cancel</button>
                            
                        </div>
                    }

                   

                </div>
            </div>
            <h1>{isEdit}</h1>

        </>
    )


}