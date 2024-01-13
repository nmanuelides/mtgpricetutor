
import {load} from 'cheerio';
import { Card } from '../entities/cards';

const THIRD_EDITION = '3rd Edition';
const THIRD_EDITION_FULL_NAME = '3rd Edition / Revised';

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    let value;

    while (!done) {
      ({ done, value } = await reader.read());

      if (done) {
        break;
      }

      if (value) {
        chunks.push(value);
      }
    }

    const totalLength = chunks.reduce((length, chunk) => length + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    const decoder = new TextDecoder();
    return decoder.decode(result);
  }

 function createCardFromElement(cardDiv: any, cardName: string, foil: boolean) {
    const cardNearMintSelector= 'li.itemAddToCart.NM.active';
    const cardSetSelector = 'input[name="category"]';
    const cardPriceSelector = 'input[name="price"]';
    const cardFinishSelector = 'input[name="variation"]';
    const cardCollectorNumberSelector = 'div.collector-number.d-none.d-sm-block';
    // Check if the card is in stock
    const cardLi = cardDiv.find(cardNearMintSelector);
    if (cardLi && cardLi.find('span.styleQtyAvailText').length > 0) {
        const name = cardName;
        const set = cardLi.find(cardSetSelector).val()?.toString();
        const price = cardLi.find(cardPriceSelector).val()?.toString();
        //This line gets only the number part of the text inside cardCollectorNumberSelector, the removes the leading 0, since now it returns something like: "Collector #: 175"
        const collectorNumber = parseInt(cardDiv.find(cardCollectorNumberSelector).text().replace(/\D/g, ""), 10).toString();
        const finish = cardLi.find(cardFinishSelector).val()?.toString().includes('Foil') ? true : foil;

        if (name && set && price) {
        const card: Card = {
            setName: set.trim() === THIRD_EDITION ? THIRD_EDITION_FULL_NAME.toLowerCase() : set.toLowerCase().trim(),
            ckPrice: price.trim(),
            collectorNumber: collectorNumber,
            foil: finish,
            priceSource: 'CK'
        };

        return card;
    }
  }
}

  function getCardPricesFromHtmlResponse(foilHtmlResponse: string, nonFoilHtmlResponse: string, cardName: string) {
    // Parse the HTML using cheerio
    const $nonFoil = load(nonFoilHtmlResponse);

    // Find all div elements with the specified class
    const cardSelector = "div.itemContentWrapper"
    const nonFoilCardDivElements = $nonFoil(cardSelector);
    const cards: Card[] = [];
    nonFoilCardDivElements.each((index, element) => {
    const cardDiv = $nonFoil(element);
    const card = createCardFromElement(cardDiv, cardName, false);
    if(card) {
        cards.push(card);
        }
    });

    console.log("TOTAL CK CARDS: " + cards.length);
    return cards;
  }

  const toKometCkUrl = (url: string, limit = 100) => {
    return `https://komet.cattaneo.uy/?headers=cors&skip=Host&Cookie=limit=${limit}&url=${url}`;
    };

  export async function getCKCardPrices(cardName: string, time: Date) {
    const url= `https://www.cardkingdom.com/catalog/search?filter%5Bname%5D=${encodeURIComponent(cardName)}`
    let cards: Card[] = [];
    try{
        const nonFoilRawResponse = await fetch(toKometCkUrl(url));
        const nonFoilHtmlStream = nonFoilRawResponse.body as ReadableStream<Uint8Array>;
        const nonFoilHtmlText = await streamToString(nonFoilHtmlStream);
        cards = getCardPricesFromHtmlResponse("", nonFoilHtmlText, cardName);
    } catch (error) {
        console.error(error);
    }
    return cards;
  }