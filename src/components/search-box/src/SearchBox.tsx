import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { getCardPrices, getAutoCompleteSuggestions, Card } from "../../../services/starCityGamesCardPrices";
import '../styles/desktop.scss';
import '../styles/mobile.scss';
import LoadingIndicator from "../../loading-indicator/src/LoadingIndicator";
import Snackbar, { SnackbarProps } from "../../snackbar/src/Snackbar";
import { ShowSnackbarContext } from "../../../contexts/showSnackbarContext";
import ReactGA from 'react-ga';
import {useTracking} from '../../../hooks/useTracking';
import SearchResults from "../../search-results";


const SearchBox = () => {
  const {trackSearchEvent} = useTracking();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType] = useState<SnackbarProps['type']>('error');
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

  return (
    <ShowSnackbarContext.Provider value={{showSnackbar, setShowSnackbar}}>
    <form className={'search-box'} onSubmit={onSubmit}>
      <div className={'search-box__input-container'}>
        <LoadingIndicator isLoading={isLoading}/>
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
        </div>
        <button className={isLoading ? 'search-box__button-disabled' : 'search-box__button'} type='submit'disabled={isLoading}>
          BUSCAR
        </button>
      </div>
      {searchResults.length > 0 &&
        <ul className={!finishedSearching ? 'search-suggestions-container__list-visible' : 'search-suggestions-container__list-invisible'}>
          {searchResults.map((cardSuggestion, index) => {
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
      <SearchResults selectedCards={selectedCards} isSearching={finishedSearching}/>
    
    </form>
    <Snackbar message={snackbarMessage} type={snackbarType}/>
    </ShowSnackbarContext.Provider>
  );
}

export default SearchBox;
