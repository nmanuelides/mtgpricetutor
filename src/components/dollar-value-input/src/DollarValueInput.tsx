import React, { useContext, useEffect, ChangeEvent, useState } from "react";
import Cookies from "js-cookie";
import "../styles/desktop.scss";
import "../styles/mobile.scss";
import { DollarValueContext } from "../../../contexts/dollarValueContext";
import { DOLAR_PIRULO } from "../../../dolar-pirulo";
import Snackbar, { SnackbarProps } from "../../snackbar/src/Snackbar";
import { ShowSnackbarContext } from "../../../contexts/showSnackbarContext";
import saveIcon from "../../../assets/save128png.png";
import classNames from "classnames";

export const SAVED_DOLLAR_VALUE_KEY = "userSavedDollarValue";

const DollarValueInput = () => {
  const { setSavedDollarValue } = useContext(DollarValueContext);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] =
    useState<SnackbarProps["type"]>("error");
  const [userInput, setUserInput] = useState(DOLAR_PIRULO.toString());
  const baseClassName = "dollar-value-input";
  useEffect(() => {
    const userSavedDollarValue = Cookies.get(SAVED_DOLLAR_VALUE_KEY);
    if (userSavedDollarValue) {
      setUserInput(userSavedDollarValue);
      setSavedDollarValue(parseFloat(userSavedDollarValue));
    }
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUserInput(input);
  };

  const handleDollarValueSaved = () => {
    if (userInput && parseFloat(userInput) > 0) {
      setSnackbarType("success");
      setSnackbarMessage("Nuevo valor del dolar guardado!");
      setShowSnackbar(true);
      setSavedDollarValue(parseFloat(userInput));
      Cookies.set(SAVED_DOLLAR_VALUE_KEY, userInput);
    } else {
      setSnackbarType("error");
      setSnackbarMessage("El valor del dolar no puede ser $0 ni estar vacío.");
      setShowSnackbar(true);
    }
  };

  return (
    <ShowSnackbarContext.Provider value={{ showSnackbar, setShowSnackbar }}>
      <div className={classNames({ [`${baseClassName}__container`]: true })}>
        <div className="input-container">
          <span className="prefix">$</span>
          <input
            className="input"
            type="number"
            value={userInput}
            autoComplete="off"
            onChange={onInputChange}
          ></input>
        </div>
        <button className={classNames({ [`${baseClassName}__button`]: true })} onClick={handleDollarValueSaved}>
          <img
            className={classNames({ [`${baseClassName}__button-image`]: true })}
            src={saveIcon}
            alt="Dolar Pirulo"
          />
        </button>
        <Snackbar message={snackbarMessage} type={snackbarType} />
      </div>
    </ShowSnackbarContext.Provider>
  );
};

export default DollarValueInput;
