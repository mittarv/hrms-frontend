import React, { useState } from 'react';
import './addUserPopup.scss';
import { Dialog, TextField } from '@mui/material';
import { createNewUser } from '../../actions/userPermissionsActions';
import { useDispatch } from 'react-redux';
import { checkEmailType } from '../../utills/emailHelper';
const AddUserPopup = ({ openpopup, setOpenPopup, handleCreateNewRow }) => {
  const dispatch = useDispatch();
  const [data, setdata] = useState({ name: "", email: "" });

  const onChange = (e) => {
    setdata({ ...data, [e.target.name]: e.target.value })
  }


  const saveuser = () => {
    if(!data.name){
      alert("Please enter the name")
      return;
    }
    if (checkEmailType(data.email) === false) {
      alert("Please enter a valid email")
      return;
    } else {
      dispatch(createNewUser(data.name, data.email))
      setTimeout(() => {
        handleCreateNewRow()
        setOpenPopup(false)
        setdata({ name: "", email: "" })
      }, 300)
    }


  }




  return (
    <Dialog open={openpopup}>
      <div className='add_user_popup'>
        <p className="add_user_heading">Add a new user</p>
        <div className="add_user_form">
          <TextField placeholder='enter name' value={data.name} name='name' onChange={onChange} />
          <TextField placeholder='enter email' value={data.email} name='email' onChange={onChange} />

        </div>

        <div className="add_user_buttons">
          <button className="cancel_add_user" onClick={() => { setOpenPopup(false); setdata({ name: "", email: "" }) }}>Cancel</button>
          <button className="save_add_user" onClick={() => { saveuser() }}>Save User</button>
        </div>

      </div>
    </Dialog>
  )
}

export default AddUserPopup
