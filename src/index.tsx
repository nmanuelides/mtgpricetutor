import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import SearchBox from './components/search-box/src/SearchBox';
import { DOLAR_PIRULO } from './dolar-pirulo';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <div className='mtg-tutor__main-container'>
      <div data-text='MTG PRICE TUTOR' className='title'>MTG PRICE TUTOR</div>
        <span className='subtitle'>Precios calculados según Dolar Pirulo: ${DOLAR_PIRULO}</span>
        <SearchBox />
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
