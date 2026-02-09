import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import '../../components/popups/RequestAccessPopup.scss'
import React, { useState , useEffect } from 'react';
import {createRequest} from '../../actions/userToolsActions'
import RequestAccessDropDown from '../dropDowns/RequestAccessDropDown';
import { useDispatch , useSelector } from 'react-redux';

function DialogBox({ open, handleClose, selectedTool }) {
    const dispatch = useDispatch();
    const { requestExecuted } = useSelector((state) => state.usertools)
    const [remark,setRemark] = useState('');
    const [selectedAccess, setSelectedAccess] = useState(0);
    const maxCharacters = 50;

    const userGroup = selectedTool?.userGroup;
    const currentRole = userGroup?.role ?? 'No access';


    // function to change the selected access type from the dropdown ,it will be passed to dropdown 
    const handleAccessChange = (selectedValue) => {
        setSelectedAccess(selectedValue);

      };


    
    useEffect(()=>{
        //the requestExecuted will be fetched from redux and it's value will determine if the dropdown needs to be closed or not
        if(requestExecuted === true){
            handleClose();
        }
    },[requestExecuted, handleClose])

    // onchange function for the remarks
    const handleChange = (event) => {
        const inputValue = event.target.value;
        if (inputValue.length <= maxCharacters) {
            setRemark(inputValue);
        }
    };


    const isButtonDisabled = remark.length === 0;
    if (!selectedTool?.tool) return null;

    return (
        <Dialog open={open} onClose={handleClose}>
            <span className='dialog_title'>Request Access</span>
            <hr></hr>
            <span className='dialog_content'>
                <span>
                    <div className='key_value_pair'>
                        <span className='key'>Tool Name:</span>
                        <span className='value'>{selectedTool.tool.name}</span>
                    </div>
                    <div className='key_value_pair'>
                        <span className='key'>Tool Description:</span>
                        <span className='value'>{selectedTool.tool.description}</span>
                    </div>
                    <div className='key_value_pair'>
                        <span className='key'>Current Access:</span>
                        <span id='value_current_access'>{currentRole}</span>
                    </div>
                    <div className='key_value_pair'>
                        <span className='key'>Request Access:</span>
                        <span className='value'> <RequestAccessDropDown label={currentRole} onChange={handleAccessChange} /></span>
                    </div>
                    <div className='key_value_pair'>
                        <span className='key'>Remarks*:</span>
                        <span className='value_textfield' > <TextField id='remark_textfield'

                            multiline
                            rows={2}
                            placeholder="Enter the reason for upgrade in access"
                            value={remark}
                            onChange={handleChange}
                            inputProps={{
                                style: {
                                    border: 'none',
                                },
                            }}
                            InputProps={{
                                sx: {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                },
                                endAdornment: (
                                    <InputAdornment position="end" className="custom-char-limit">
                                        <span> {`${remark.length}/${maxCharacters}`}</span   >
                                    </InputAdornment>
                                ),
                            }}
                        /></span>
                    </div>
                </span>
            </span>
            <DialogActions className='action_button'>
                <Button id='close_button' onClick={handleClose} color="primary">
                    Cancel

                </Button>
                <Button onClick={()=>{
                    // toolId,currentUserGroup,  reqUserGroupId, remark
                   dispatch(createRequest(selectedTool.tool.toolId, userGroup?.id ?? null, selectedAccess, remark))
                }} disabled={isButtonDisabled} id={isButtonDisabled ? 'req_button_disabled' : 'req_button_enabled'} color="primary">
                    Request
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DialogBox;