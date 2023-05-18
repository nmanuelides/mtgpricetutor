import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import SearchBox from './components/search-box/src/SearchBox';
import { DOLAR_PIRULO } from './dolar-pirulo';
import DollarValueInput from './components/dollar-value-input/src/DollarValueInput';
import { DollarValueContext } from './contexts/dollarValueContext';

const App = () => {
  const [savedDollarValue, setSavedDollarValue] = React.useState(DOLAR_PIRULO);

  return (
    <React.StrictMode>
      <DollarValueContext.Provider
        value={{ savedDollarValue, setSavedDollarValue }}
      >
        <div className='mtg-tutor__background' />
        <div className='mtg-tutor__main-container'>
          <div data-text='MTG PRICE TUTOR' className='title'>
            MTG PRICE TUTOR
          </div>
          <span className='subtitle'>Precios de Star City Games</span>
          <span className='subtitle'>
            Valor en pesos calculado segun dólar:
          </span>
          <DollarValueInput />
          <SearchBox />
        </div>
      </DollarValueContext.Provider>
    </React.StrictMode>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
