import { responseInterceptor } from "http-proxy-middleware";
import { getPixelColor } from "../components/helpers/imageColors";
import { Card } from '../entities/cards';

const NEAR_MINT_CONDITION = 'Near Mint';

const defaultOptions = {
  method: 'POST',
  headers: {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://starcitygames.com',
    'referer': 'https://starcitygames.com/',
    'sec-ch-ua': '"Not?A_Brand";v="99", "Opera GX";v="97", "Chromium";v="111"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 OPR/97.0.0.0'
  },
};

export async function getAutoCompleteSuggestions(searchValue: string) {
  const url = "https://essearchapi-na.hawksearch.com/api/v2/autocomplete";
  const options = {...defaultOptions, body: JSON.stringify({
    "Keyword": `${searchValue}`,
    "MaxPerPage": 24,
    "SortBy": "score",
    "clientguid": "cc3be22005ef47d3969c3de28f09571b",
    "clientdata": {
      "custom": {
        "custom": "showvalues"
      }
    }
  })};
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const suggestions = data.Categories.map((suggestion: any) => {
      const currentSuggestion: string = decodeURIComponent(suggestion.FieldQSValue).replace(/%c%/g, ',')
      return currentSuggestion;
    });
    return suggestions;
  } catch(error) {
    console.error(error);
  }
}

const getCollectorNumber = (card: any) => {
  let collectorNumber = ""
  if (card.collector_number) {
    const preFormatedCollectorNumber = card.collector_number[0].match(/\d+$/);
    collectorNumber = preFormatedCollectorNumber ? preFormatedCollectorNumber[0] : '';
  } else if(card.sku) {
    const regex = /(\d+)-[^-]*$/;
    const match = card.sku[0].match(regex);

    let result = "";
    if (match && match[1]) {
      result = parseInt(match[1], 10).toString();
      }
    collectorNumber = result;
  }
  return collectorNumber;
}

const isValidCard = (cards: any[]) => {
  return cards.some((card: any) => 'condition' in card && card.condition[0] === 'Near Mint');
}

const getNearMintCard = (cards: any[]) => {
  return cards.find(card => card.condition[0] === 'Near Mint');
}

const getStock = (cards: any[]) => {
  const cardInStock = cards.find(card => {
    if('qty' in card) {
      return card.qty[0] !== '0'
      }
    });
  return cardInStock ? parseInt(cardInStock.qty[0]) : 0;
}

const getSetName = (set: string) => {
  let setName = ''
  if(set.toLowerCase().includes('promo')) {
    setName = 'promo';
  } else {
    setName = set.replace("(Foil)", "").trim();
  }
  return setName.toLowerCase().trim();
}

export async function getCardPrices(cardName: string, time: Date) {
    const url ="https://essearchapi-na.hawksearch.com/api/v2/search";

    const options = {...defaultOptions, body: JSON.stringify({
      Keyword: "",
      Variant: {
        MaxPerPage: 96
      },
      FacetSelections: {
        card_name: [`${cardName}`]
      },
      PageNo: 1,
      MaxPerPage: 96,
      clientguid: "cc3be22005ef47d3969c3de28f09571b"
    })};
    const scgResponseCards: Card[] = []
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      //console.log("--------------");

      for (const card of data.Results) {
        const scgCards = card.Document.hawk_child_attributes;
        if (isValidCard(scgCards)) {
          const nearMintCard = getNearMintCard(scgCards);
          const priceNumber = parseFloat(nearMintCard.price[0]);
          const formattedPrice = priceNumber.toFixed(2);
          const isFoil = card.Document.finish[0].toLowerCase() === "foil";
          const stock = getStock(scgCards);

          const borderColorHexValue = await getPixelColor(card.Document.image?.[0]).catch((error) => {
            console.error(error);
            return "";
          });

          const currentCard: Card = {
            image: card.Document.image?.[0],
            collectorNumber: getCollectorNumber(card.Document),
            setName: getSetName(card.Document.set?.[0]),
            scgPrice: formattedPrice,
            price: formattedPrice,
            borderColor: borderColorHexValue,
            foil: isFoil,
            priceSource: "SCG",
            stock: stock
          };

          if (formattedPrice === "0") {
            currentCard.lastPrice = priceNumber.toFixed(2);
          }

          /*console.log( "Source: " + currentCard.priceSource +"\n"+"Set name: "+currentCard.setName+"\n"+"Price: "+currentCard.scgPrice+
            "\n"+"Foil: "+currentCard.foil+"\n"+"Collector Nº: "+currentCard.collectorNumber+"\n");*/

          scgResponseCards.push(currentCard);
        }
      }
    } catch (error) {
      console.error(error);
    }
    console.log("TOTAL SCG CARDS: " + scgResponseCards.length);
    const endTime = new Date();
    console.log("SCG RESULTS took: " + (endTime.getTime() - time.getTime())/1000);
    return scgResponseCards;
};