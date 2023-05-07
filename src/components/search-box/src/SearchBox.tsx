import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { fetchCards, fetchCardByName } from "../../../services/cards";
import { getCardPrices, Card } from "../../../services/starCityGamesCardPrices";
import Tilt from '../../../hoc/Tilt';
import '../styles/desktop.scss';
import '../styles/mobile.scss';
import { DOLAR_PIRULO } from "../../../dolar-pirulo";
import { getFontColorForBackground } from "../../helpers/imageColors";

const SearchBox = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const options = {
    reverse:           true,  // reverse the tilt direction
    max:               15,     // max tilt rotation (degrees)
    perspective:       1000,   // Transform perspective, the lower the more extreme the tilt gets.
    scale:             1,      // 2 = 200%, 1.5 = 150%, etc..
    speed:             300,    // Speed of the enter/exit transition
    transition:        true,   // Set a transition on enter/exit.
    axis:              null,   // What axis should be disabled. Can be X or Y.
    reset:             true,    // If the tilt effect has to be reset on exit.
    easing:            "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
    glare:             true,   // if it should have a "glare" effect
    "max-glare":       0.35,      // the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
    "glare-prerender": false   // false = VanillaTilt creates the glare elements for you, otherwise
                               // you need to add .js-tilt-glare>.js-tilt-glare-inner by yourself
}

  const priceClassForBorderColor = (borderColor: string): string => {
    let classForBorderColor= '';
    switch (borderColor) {
      case 'black':
        classForBorderColor = 'search-results-container__card-price-container-black';
        break;
      case 'white':
        classForBorderColor = 'search-results-container__card-price-container-white';
        break;
      case 'silver':
        classForBorderColor = 'search-results-container__card-price-container-silver';
        break;
      case 'colorless':
        classForBorderColor = 'search-results-container__card-price-container-borderless';
        break;
      default:
        classForBorderColor = 'search-results-container__card-price-container-black';
        break;
    }

    return classForBorderColor;
  }
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
    /* fetchCardByName(searchResults[selectedCardIndex]).then(results => {
      setSearchResults([])
      setSelectedCards(results)
    }).catch(error => {
      console.error(error);
    }); */
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
        <input name='searchInput' className={'search-box__input-text'} type="text" value={searchTerm} ref={inputRef} onChange={onInputChange} />
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
            const priceStyle = { background: card.borderColor, color: getFontColorForBackground(card.borderColor) };
            return (
              <Tilt options={options} className="search-results-container__card" key={card.image}>
                <img src={card.image} alt="Example image" className={'search-results-container__card-image'} key={card.image}/>
                <div className={'search-results-container__card-price-container'} style={priceStyle}>
                  <span>US${card.price}</span>
                  <span>AR${(parseFloat(card.price)*DOLAR_PIRULO).toFixed(2)}</span>
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
