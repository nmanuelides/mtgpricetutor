import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { getCardPrices, getAutoCompleteSuggestions, Card } from "../../../services/starCityGamesCardPrices";
import Tilt from '../../../hoc/Tilt';
import { tiltOptions } from "../../../hoc/tiltOptions";
import { DOLAR_PIRULO } from "../../../dolar-pirulo";
import { getFontColorForBackground } from "../../helpers/imageColors";
import '../styles/desktop.scss';
import '../styles/mobile.scss';
import LoadingIndicator from "../../loading-indicator/src/LoadingIndicator";
import Snackbar from "../../snackbar/src/Snackbar";
import { ShowSnackbarContext } from "../../../contexts/showSnackbarContext";
import ReactGA from 'react-ga';
import {useTracking} from '../../../hooks/useTracking';
import buttonImg from '../../../assets/search-button.png';
import buttonLoadingImg from '../../../assets/search-button-loading-active.png';

const SearchBox = () => {
  const {trackSearchEvent} = useTracking();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [finishedSearching, setFinishedSearching] = useState(true)

  const debouncedSearchHandler = useRef(
    debounce(async (searchTerm: string) => {
      try {
        const data = await getAutoCompleteSuggestions(searchTerm);
        setSearchResults(data || []);
      } catch (error) {
        console.error(error);
      }
    }, 250)
  ).current;

  useEffect(() => {
    ReactGA.initialize('G-CF7ZCPKRC3');
  }, []);

  useEffect(() => {
    if(searchTerm !== ''){
      debouncedSearchHandler(searchTerm);
    }
  }, [searchTerm, debouncedSearchHandler]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      setSearchTerm('');
      //setSearchResults([]);
      setSelectedCards([])
      return;
    }
    setFinishedSearching(false);
    setSearchTerm(searchTerm);
    debouncedSearchHandler(searchTerm);
  }

  const onCardSelected = async (selectedCardIndex: number) => {
    const cardName = searchResults[selectedCardIndex];
    setSearchResults([]);
    setIsLoading(true)
    setFinishedSearching(true);
    try {
      trackSearchEvent(cardName);
      const results = await getCardPrices(cardName);
      setSelectedCards(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inputValue = inputRef.current?.value;
    if(!inputValue) {
      setSnackbarMessage('Tienes que ingresar el nombre de una carta para poder buscarla.');
      setShowSnackbar(true);
      return;
    }
    let cardName = '';

    inputValue && searchResults.forEach((cardSuggestion: string) => {
      if (cardSuggestion.toLowerCase() === inputValue.toLowerCase().trim()) {
        cardName = cardSuggestion;
      }
    });

    if (!cardName) {
      setSnackbarMessage('La carta que ingresaste no existe o su nombre está mal escrito.');
      setShowSnackbar(true);
      return;
    }
    setFinishedSearching(true);
    debouncedSearchHandler.cancel();
    setIsLoading(true);
    try {
      trackSearchEvent(cardName);
      const results = await getCardPrices(cardName);
      setSelectedCards(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceSize = (span: HTMLElement | null) => {
    let priceWidth = 62;
    if (span) {
      priceWidth = span?.offsetWidth;
    }
    return priceWidth;
  }

  const getFontSizeForSpan = (span: HTMLElement | null) => {
    const elementWidth = getPriceSize(span);
    const minWidth = 44;
    const maxWidth = 80;
    const minFontSize = 8;
    const maxFontSize = 16;
    let fontSize;
    const isDesktop = window.innerWidth >= 768
    if(isDesktop) {
      return fontSize = 18;
    }
    if (elementWidth >= maxWidth) {
      fontSize = minFontSize;
    } else if (elementWidth <= minWidth) {
      fontSize = maxFontSize;
    } else {
      const widthRange = maxWidth - minWidth;
      const widthDifference = maxWidth - elementWidth;
      const fontSizeDifference = maxFontSize - minFontSize;
      fontSize = minFontSize + (fontSizeDifference * widthDifference) / widthRange;
    }
    return fontSize;
  }

  return (
    <ShowSnackbarContext.Provider value={{showSnackbar, setShowSnackbar}}>
    <form className={selectedCards.length > 0 ? 'search-box__with-results' : 'search-box'} onSubmit={onSubmit}>
      <div className={'search-box__input-container'}>
        <div className='search-box__input-text-container'>
        <input name='searchInput' className={isLoading ? 'search-box__input-text-disabled' : 'search-box__input-text'} type="text" value={searchTerm} ref={inputRef} onChange={onInputChange} autoComplete="off" placeholder="Ingresá el nombre de una carta" disabled={isLoading}/>
        <LoadingIndicator isLoading={isLoading}/>
        </div>
        <button className={'search-box__button'} type='submit'disabled={isLoading}>
          <img className={'search-box__button-image'} src={isLoading ? buttonLoadingImg : buttonImg}/>
        </button>
      </div>
      {searchResults.length > 0 &&
        <ul className={!finishedSearching ? 'search-suggestions-container__list-visible' : 'search-suggestions-container__list-invisible'}>
          {searchResults.map((cardSuggestion, index) => {
            return <li className={'search-suggestions-container__result-item'} key={cardSuggestion} onClick={() => onCardSelected(index)}>{cardSuggestion}</li>
          })}
        </ul>
      }
    <div className={'search-results-container'}>
      {selectedCards.length > 0 && (
        <div className={finishedSearching ? 'search-results-container__card-results': 'search-results-container__card-results-blurred'}>
        <div className={'search-results-container__card-results-list'}>
          {selectedCards.map((card: Card, index) => {
            if (card.borderColor.length > 0) {

              const dollarPriceId = `dollarPrice${index}`;
              const pesosPriceId = `pesosPrice${index}`;
              const dollarSpan = document.getElementById(dollarPriceId);
              const pesosSpan = document.getElementById(pesosPriceId);
              const contrastingColor = getFontColorForBackground(card.borderColor);
              const priceStyle = { background: card.borderColor, color: contrastingColor };
              const arsPriceStyle = { border: `2px solid ${contrastingColor}`, borderRadius: '8px', padding: '4px', fontSize: `${getFontSizeForSpan(pesosSpan)}px`};
              const dollarsStyle: CSSProperties = { fontSize: `${getFontSizeForSpan(dollarSpan)}px` };
              return (
                <Tilt options={tiltOptions} className="search-results-container__card" key={card.image}>
                  <img src={card.image} alt="Example image" className={'search-results-container__card-image'} key={card.image}/>
                  <div className={'search-results-container__card-price-container'} style={priceStyle}>
                    <span id={dollarPriceId} className='search-results-container__card-price-container-dollars' style={dollarsStyle}>US${card.price}</span>
                    <span id={pesosPriceId}className='search-results-container__card-price-container-pesos' style={arsPriceStyle} >AR${(parseFloat(card.price)*DOLAR_PIRULO).toFixed(2)}</span>
                  </div>
                </Tilt>
              )
            }
          })}
        </div>
        </div>
      )}
      </div>
    </form>
    <Snackbar message={snackbarMessage}/>
    </ShowSnackbarContext.Provider>
  );
}

export default SearchBox;
