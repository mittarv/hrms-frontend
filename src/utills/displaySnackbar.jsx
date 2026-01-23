import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSnackbarText} from '../actions/avToolsAction';
import './snackbar.scss';

const DisplaySnackbar = () => {
    const dispatch = useDispatch();
    const {snackbarText, snackBarType} = useSelector((state) => state.avToolsReducer);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if(snackbarText !==''){
        setVisible(true);
        const timer = setTimeout(() => {
            dispatch(resetSnackbarText());
            setVisible(false);
        }, 3500);
        return () => clearTimeout(timer);
    }

  }, [snackbarText, snackBarType,dispatch]);

  return (
    visible && (
      <div className={`message ${snackBarType}`}>
        {snackbarText}
      </div>
    )
  );
};

export default DisplaySnackbar;
