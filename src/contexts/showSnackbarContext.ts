import { createContext } from 'react';

type ShowSnackbarState = {
  showSnackbar: boolean;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ShowSnackbarContext = createContext<ShowSnackbarState>({
    showSnackbar: false,
    setShowSnackbar: () => {},
});
