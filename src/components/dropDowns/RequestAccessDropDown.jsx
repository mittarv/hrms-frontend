import { FormControl, Select, SvgIcon } from '@mui/material';
import { useState ,useEffect, useCallback } from 'react';
import MenuItem from '@mui/material/MenuItem';
import '../dropDowns/RequestAccessDropDown.scss'
import bottomArrow from "../../assets/icons/bottom_arrow.svg";
import {fetchUserGroups} from '../../actions/userGroupsActions'
import { useDispatch, useSelector } from 'react-redux';

function RequestAccessDropDown(props) {
    const dispatch = useDispatch();
    const {label , onChange} = props;
    
    const [access, setAccess] = useState(label);
    
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        setAccess(selectedValue);

        //passed from the popup screen to get the selected access type from here.
        onChange(userGroupsData.find((group)=>group.role === event.target.value).id);
    };

    const getdata = useCallback(()=>{
        dispatch(fetchUserGroups())
    },[dispatch])

    
    useEffect(()=>{
        getdata();
    },[getdata])
    
    const { userGroupsData } = useSelector((state) => state.usergroup);
    const userGroupsForDropdown = userGroupsData?.filter((g) => g.role !== "Super Admin") ?? [];

    //CUSTOM ICON FOR THE DROP DOWN
    function CustomSVGIcon({ src, ...props }) {
        return (
            <SvgIcon {...props} style={{ lineHeight: '0', fontSize: '16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <image xlinkHref={bottomArrow} width="100%" height="100%" />
                </svg>
            </SvgIcon>
        );
    }
    const selectStyle = {
        '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
        },
    };

    return (
        <FormControl sx={{ m: -1, minWidth: 106 }} size="small">

            <Select
                labelId="demo-select-large-label"
                id="default_state_box"
                sx={selectStyle}
                onChange={handleChange}
                IconComponent={CustomSVGIcon}
                value = {access}

            >
                {
                    userGroupsForDropdown?.map((usergroup) => (
                        <MenuItem key={usergroup.id} id="custom-menu-item" value={usergroup.role}>{usergroup.role}</MenuItem>
                    ))
                }
                {/* <MenuItem id="custom-menu-item" value="Tool Admin" disabled={true}>Tool Admin</MenuItem> */}
                
            </Select>
        </FormControl>
    )
}

export default RequestAccessDropDown;