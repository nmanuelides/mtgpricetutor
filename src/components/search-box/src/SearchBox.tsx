import React, { CSSProperties, useEffect, useRef, useState, useContext } from "react";
import { debounce } from "lodash";
import { getCardPrices, getAutoCompleteSuggestions } from "../../../services/starCityGamesCardPrices";
import Tilt from '../../../hoc/Tilt';
import { tiltOptions } from "../../../hoc/tiltOptions";
import { getFontColorForBackground } from "../../helpers/imageColors";
import '../styles/desktop.scss';
import '../styles/mobile.scss';
import LoadingIndicator from "../../loading-indicator/src/LoadingIndicator";
import Snackbar, { SnackbarProps } from "../../snackbar/src/Snackbar";
import { ShowSnackbarContext } from "../../../contexts/showSnackbarContext";
import ReactGA from 'react-ga';
import {useTracking} from '../../../hooks/useTracking';
import buttonImg from '../../../assets/search-button.png';
import buttonLoadingImg from '../../../assets/search-button-loading-active.png';
import { DollarValueContext } from "../../../contexts/dollarValueContext";
import { getCKCardPrices } from "../../../services/cardKingdomCardPrices";
import { Card } from '../../../entities/cards';
import { mergeArrays } from "../../helpers/arrayHelper";

const SearchBox = () => {
  const {trackSearchEvent} = useTracking();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoCompleteSuggestionsResults, setAutoCompleteSuggestionsResults] = useState<string[]>([]);
  const [scgCards, setSCGCards] = useState<Card[]>([]);
  const [ckCards, setCKCards] = useState<Card[]>([]);
  const [cardsResult, setCardsResult] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType] = useState<SnackbarProps['type']>('error');
  const [finishedSearching, setFinishedSearching] = useState(true)
  const {savedDollarValue} = useContext(DollarValueContext);
  const OUT_OF_STOCK = 'Out of stock';

  const debouncedSearchHandler = useRef(
    debounce(async (searchTerm: string) => {
      try {
        const data = await getAutoCompleteSuggestions(searchTerm);
        setAutoCompleteSuggestionsResults(data || []);
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
      setSCGCards([])
      return;
    }
    setFinishedSearching(false);
    setSearchTerm(searchTerm);
    debouncedSearchHandler(searchTerm);
  }

  const onCardSelected = async (selectedCardIndex: number) => {
    const cardName = autoCompleteSuggestionsResults[selectedCardIndex];
    setAutoCompleteSuggestionsResults([]);
    setIsLoading(true)
    setFinishedSearching(true);
    try {
      trackSearchEvent(cardName);
      const ckResults = await getCKCardPrices(cardName);
      //setCKCards(ckResults);
      const scgResults = await getCardPrices(cardName);
      //setSCGCards(results);
      setCardsResult(mergeArrays(scgResults, ckResults));
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

    inputValue && autoCompleteSuggestionsResults.forEach((cardSuggestion: string) => {
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
      setSCGCards(results);
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
    const minFontSize = 10;
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

  const getUSDPrice = (card: Card) => {
    let usdPrice = 'Out of stock'
    if(card.scgPrice && parseFloat(card.scgPrice)>0) {
        usdPrice = card.scgPrice;
    } else if (card.ckPrice){
      usdPrice = card.ckPrice;
    }
    return usdPrice
  }

  return (
    <ShowSnackbarContext.Provider value={{showSnackbar, setShowSnackbar}}>
    <form className={scgCards.length > 0 ? 'search-box__with-results' : 'search-box'} onSubmit={onSubmit}>
      <div className={'search-box__input-container'}>
        <div className='search-box__input-text-container'>
        <input
          name='searchInput'
          className={isLoading ? 'search-box__input-text-disabled' : 'search-box__input-text'}
          type="text"
          value={searchTerm}
          ref={inputRef}
          onChange={onInputChange}
          autoComplete="off"
          placeholder="Ingresá el nombre de una carta..."
          disabled={isLoading}
        />
        <LoadingIndicator isLoading={isLoading}/>
        </div>
        <button className={'search-box__button'} type='submit'disabled={isLoading}>
          <img className={'search-box__button-image'} src={isLoading ? buttonLoadingImg : buttonImg} alt='search button'/>
        </button>
      </div>
      {autoCompleteSuggestionsResults.length > 0 &&
        <ul className={!finishedSearching ? 'search-suggestions-container__list-visible' : 'search-suggestions-container__list-invisible'}>
          {autoCompleteSuggestionsResults.map((cardSuggestion, index) => {
            return  <li
                      className={'search-suggestions-container__result-item'}
                      key={cardSuggestion}
                      onClick={() => onCardSelected(index)}
                    >
                      {cardSuggestion}
                    </li>
          })}
        </ul>
      }
    <div className={'search-results-container'}>
      {cardsResult.length > 0 && (
        <div className={finishedSearching ? 'search-results-container__card-results': 'search-results-container__card-results-blurred'}>
        <div className={'search-results-container__card-results-list'}>
          {cardsResult.map((card: Card, index) => {
            if (card.borderColor && card.borderColor.length > 0) {
              const dollarPriceId = `dollarPrice${index}`;
              const pesosPriceId = `pesosPrice${index}`;

              const dollarSpan = document.getElementById(dollarPriceId);
              const pesosSpan = document.getElementById(pesosPriceId);

              const contrastingColor = getFontColorForBackground(card.borderColor);
              const priceInDollars: string = getUSDPrice(card);
              const priceStyle = { background: card.borderColor, color: priceInDollars === OUT_OF_STOCK ? '#FF0000': contrastingColor };
              const arsPriceStyle = { border: `2px solid ${contrastingColor}`, borderRadius: '8px', padding: '4px', fontSize: `${getFontSizeForSpan(pesosSpan)}px`};
              const dollarsStyle: CSSProperties = { fontSize: `${getFontSizeForSpan(dollarSpan)}px` };
              const priceInPesos= ((priceInDollars === OUT_OF_STOCK && card.lastPrice ? parseFloat(card.lastPrice) : parseFloat(priceInDollars)) * savedDollarValue).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                minimumIntegerDigits: 1,
                useGrouping: true,
              });

              return (
                <Tilt options={tiltOptions} className="search-results-container__card" key={card.image}>
                  <img src={card.image} alt="Card image" className={'search-results-container__card-image'} key={card.image}/>
                  <div className={'search-results-container__card-price-container'} style={priceStyle}>
                    <span
                      id={dollarPriceId}
                      className='search-results-container__card-price-container-dollars'
                      style={dollarsStyle}>
                       {priceInDollars === OUT_OF_STOCK ? `${" US$"+card.lastPrice}` : `US$${priceInDollars}`}
                    </span>

                    <span
                      id={pesosPriceId}
                      className='search-results-container__card-price-container-pesos'
                      style={arsPriceStyle}>
                        AR${priceInPesos}
                    </span>
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
    <Snackbar message={snackbarMessage} type={snackbarType}/>
    </ShowSnackbarContext.Provider>
  );
}

export default SearchBox;
