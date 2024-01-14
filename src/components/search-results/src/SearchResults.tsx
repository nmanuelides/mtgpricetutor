import React, { CSSProperties, useContext } from "react";
import {Card} from "../../../services/starCityGamesCardPrices";
import { getFontColorForBackground } from "../../helpers/imageColors";
import { getFontSizeForSpan } from "../../helpers/fontHelper";
import { DollarValueContext } from "../../../contexts/dollarValueContext";
import Tilt from '../../../hoc/Tilt';
import { tiltOptions } from "../../../hoc/tiltOptions";
import '../styles/desktop.scss';

interface searchResultsProps {
    selectedCards: Card[];
    isSearching: boolean
}

const SearchResults = ({selectedCards, isSearching}: searchResultsProps): JSX.Element => {
    const {savedDollarValue} = useContext(DollarValueContext);
    return (
        <div className={'search-results-container'}>
        {selectedCards.length > 0 && (
          <div className={isSearching ? 'search-results-container__card-results': 'search-results-container__card-results-blurred'}>
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
                const priceInPesos= (parseFloat(card.price) * savedDollarValue).toFixed(2);
                console.log('PRICE IN PESOS: '+priceInPesos);
                return (
                  <Tilt options={tiltOptions} className="search-results-container__card" key={card.image}>
                    <img src={card.image} alt="Card" className={'search-results-container__card-image'} key={card.image}/>
                    <div className={'search-results-container__card-price-container'} style={priceStyle}>
                      <span
                        id={dollarPriceId}
                        className='search-results-container__card-price-container-dollars'
                        style={dollarsStyle}>
                          US${card.price}
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
              } else return null;
            })}
          </div>
          </div>
        )}
        </div>
    )
}

export default SearchResults;