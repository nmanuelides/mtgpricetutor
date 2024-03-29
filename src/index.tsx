import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import SearchBox from "./components/search-box/src/SearchBox";
import { DOLAR_PIRULO } from "./dolar-pirulo";
import DollarValueInput from "./components/dollar-value-input/src/DollarValueInput";
import { DollarValueContext } from "./contexts/dollarValueContext";
import mtgLogo from "./assets/MTGPT-LogoV2.png";

const App = () => {
  const [savedDollarValue, setSavedDollarValue] = React.useState(DOLAR_PIRULO);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "portfolio") {
      document.getElementsByClassName("curtain-off")[0].classList.add("curtain-on");
    }
  }, []);

  return (
    <React.StrictMode>
      <DollarValueContext.Provider value={{ savedDollarValue, setSavedDollarValue }}>
        <div className="curtain-off" />
        <div className="mtg-tutor__background" />
        <div className="mtg-tutor__main-container">
          <div data-text="MTG PRICE TUTOR" className="header">
            MTG
            <br /> PRICE TUTOR
            <img className="header-image" src={mtgLogo} alt="MTG Logo"></img>
          </div>
          <span className="subtitle">
            Precios de Star City Games <br />
            Valor en pesos calculado según dolar:
          </span>

          <DollarValueInput />
          <SearchBox />
        </div>
      </DollarValueContext.Provider>
    </React.StrictMode>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

reportWebVitals();
