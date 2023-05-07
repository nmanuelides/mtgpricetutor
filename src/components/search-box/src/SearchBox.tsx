import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { fetchCards } from "../../../services/cards";
import { getCardPrices, Card } from "../../../services/starCityGamesCardPrices";
import Tilt from '../../../hoc/Tilt';
import { tiltOptions } from "../../../hoc/tiltOptions";
import { DOLAR_PIRULO } from "../../../dolar-pirulo";
import { getFontColorForBackground } from "../../helpers/imageColors";
import '../styles/desktop.scss';
import '../styles/mobile.scss';

const SearchBox = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const debouncedSearchHandler = useRef(
    debounce((searchTerm: string) => {
      fetchCards(searchTerm).then(data => {
        setSearchResults(data.data);
      }).catch(error => {
        console.error(error);
      });
    }, 300)
  ).current;

  const onCardSelected = (selectedCardIndex: number) => {
    getCardPrices(searchResults[selectedCardIndex]).then(results => {
      setSearchResults([]);
      setSelectedCards(results);
    }).catch(error => {
      console.error(error);
    })
  }

  useEffect(() => {
    if(searchTerm !== ''){
      debouncedSearchHandler(searchTerm);
    }
  }, [searchTerm, debouncedSearchHandler]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedCards([])
      return;
    }
    setSearchTerm(searchTerm);
    debouncedSearchHandler(searchTerm);
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchValue = inputRef.current?.value;
    searchValue && getCardPrices(searchValue).then(results => {
      setSearchResults([]);
      setSelectedCards(results);
    }).catch(error => {
      console.error(error)
    })
  }
  return (
    <form className={selectedCards.length > 0 ? 'search-box__with-results' : 'search-box'} onSubmit={onSubmit}>
      <div className={'search-box__input-container'}>
        <input name='searchInput' className={'search-box__input-text'} type="text" value={searchTerm} ref={inputRef} onChange={onInputChange} autoComplete="off"/>
        <button className={'search-box__button'} type='submit'>Search</button>
      </div>
      <div className={'search-results-container'}>
      {searchResults.length > 0 &&
        <ul className={'search-results-container__list'}>
          {searchResults.map((card, index) => {
            return <li className={'search-results-container__result-item'} key={card} onClick={() => onCardSelected(index)}>{card}</li>
          })}
        </ul>
      }
      {selectedCards.length > 0 && (
        <div className={searchResults.length > 0 ? 'search-results-container__card-results-blurred' :'search-results-container__card-results'}>
        <div className={'search-results-container__card-results-list'}>
          {selectedCards.map((card: Card) => {
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
                {console.log('Border color: '+card.borderColor)}
              </Tilt>
            )
          })}
        </div>
        </div>
      )}
      </div>
    </form>
  );
}

export default SearchBox;
