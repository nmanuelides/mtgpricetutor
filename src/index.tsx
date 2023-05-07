import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import SearchBox from './components/search-box/src/SearchBox';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <div className={'mtg-tutor__main-container'}>
      <div className='title'>MTG TUTOR</div>
    <SearchBox />
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
