import React, { useEffect, useRef, useState } from "react";
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

const SearchBox = () => {
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
      console.log('onCardSelected searching for: '+cardName)
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
      console.log('onSubmit searching for: '+cardName)
      const results = await getCardPrices(cardName);
      setSelectedCards(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ShowSnackbarContext.Provider value={{showSnackbar, setShowSnackbar}}>
    <form className={selectedCards.length > 0 ? 'search-box__with-results' : 'search-box'} onSubmit={onSubmit}>
      <div className={'search-box__input-container'}>
        <div className='search-box__input-text-container'>
        <input name='searchInput' className={isLoading ? 'search-box__input-text-disabled' : 'search-box__input-text'} type="text" value={searchTerm} ref={inputRef} onChange={onInputChange} autoComplete="off" placeholder="Ingresá el nombre de una carta" disabled={isLoading}/>
        <LoadingIndicator isLoading={isLoading}/>
        </div>
        <button className={isLoading ? 'search-box__button-loading' :'search-box__button'} type='submit'disabled={isLoading}></button>
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
          {selectedCards.map((card: Card) => {
            if (card.borderColor.length > 0) {
              const contrastingColor = getFontColorForBackground(card.borderColor);
              const priceStyle = { background: card.borderColor, color: contrastingColor };
              const arsPriceStyle = {border: `2px solid ${contrastingColor}`, borderRadius:'8px', padding:'4px'}
              return (
                <Tilt options={tiltOptions} className="search-results-container__card" key={card.image}>
                  <img src={card.image} alt="Example image" className={'search-results-container__card-image'} key={card.image}/>
                  <div className={'search-results-container__card-price-container'} style={priceStyle}>
                    <span>US${card.price}</span>
                    <span style={arsPriceStyle} >AR${(parseFloat(card.price)*DOLAR_PIRULO).toFixed(2)}</span>
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
