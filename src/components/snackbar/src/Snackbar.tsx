import { FC, useContext, useEffect, useState } from 'react';
import '../styles/desktop.scss';
import '../styles/mobile.scss';
import {ShowSnackbarContext} from '../../../contexts/showSnackbarContext';

export interface SnackbarProps {
  message: string;
  type: 'error' | 'success';
}

const Snackbar: FC<SnackbarProps> = ({ message, type }) => {
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
  }, [showSnackbar, setShowSnackbar]);

  return (
    <>
      {visible && (
        <div className={type === 'error' ? 'snackbar snackbar-error' : 'snackbar snackbar-success'}>
          {message}
        </div>
      )}
    </>
  );
};

export default Snackbar;
