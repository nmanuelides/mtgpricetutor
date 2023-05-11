import React, { FC, useContext, useEffect, useState } from 'react';
import '../styles/desktop.scss';
import '../styles/mobile.scss';
import {ShowSnackbarContext} from '../../../contexts/showSnackbarContext';

interface SnackbarProps {
  message: string;
}

const Snackbar: FC<SnackbarProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const {showSnackbar, setShowSnackbar} = useContext(ShowSnackbarContext);

  useEffect(() => {
    if (showSnackbar) {
      setVisible(true);
      const timer = setTimeout(() => {
        setShowSnackbar(false);
        setVisible(false);
    }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showSnackbar]);

  return (
    <>
      {visible && (
        <div className='snackbar'>
          {message}
        </div>
      )}
    </>
  );
};

export default Snackbar;
