import { getPixelColor } from "../components/helpers/imageColors";

export interface Card {
    image: string;
    collectorNumber: string;
    uniqueId: string;
    set: string;
    price: string;
    borderColor: string;
}

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

export async function getCardPrices(cardName: string) {
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
    })}
    const response = await fetch(url, options);
    const data = await response.json();

    const promises = data.Results.map(async (card: any) => {
    const priceNumber = Number(card.Document.price_retail?.[0]);
    const formattedPrice = priceNumber.toFixed(2);

    const borderColorHexValue = await getPixelColor(card.Document.image?.[0]).catch(error => {
    console.error(error);
    return '';
    });

    const currentCard: Card = {
        image: card.Document.image?.[0],
        collectorNumber: card.Document.collector_number?.[0],
        uniqueId: card.Document.unique_id?.[0],
        set: card.Document.set?.[0],
        price: formattedPrice,
        borderColor: borderColorHexValue
    };

    return currentCard;
    });

    const cardPrices = await Promise.all(promises);
    return cardPrices;
};