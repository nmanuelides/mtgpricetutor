
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

        console.log("Source: "+card.priceSource+"\n"+"Set name: "+ card.setName+"\n"+"Price: "+card.ckPrice+"\n"+"Foil: "+card.foil+"\n"+"Collector Nº: "+card.collectorNumber+"\n");
        return card;
    }
  }
}

  function getCardPricesFromHtmlResponse(foilHtmlResponse: string, nonFoilHtmlResponse: string, cardName: string) {
    // Parse the HTML using cheerio
    const $nonFoil = load(nonFoilHtmlResponse);
    //const $foil = load(foilHtmlResponse);

    // Find all div elements with the specified class
    const cardSelector = "div.itemContentWrapper"
    const nonFoilCardDivElements = $nonFoil(cardSelector);
    //const foilCardLiElements = $foil('li.itemAddToCart.NM.active');
    console.log("--------------");
    // Iterate over the card divs and extract the desired information
    const cards: Card[] = [];
    nonFoilCardDivElements.each((index, element) => {
    const cardDiv = $nonFoil(element);
    const card = createCardFromElement(cardDiv, cardName, false);
    if(card) {
        cards.push(card);
        }
    });

    /*foilCardLiElements.each((index, element) => {
        const cardLi = $foil(element);
        const card = createCardFromElement(cardLi, cardName, true);
        if(card) {
            cards.push(card);
            }
        });*/
    console.log("TOTAL CK CARDS: " + cards.length);
    return cards;
  }

  const toKometCkUrl = (url: string, limit = 100) => {
    return `https://komet.cattaneo.uy/?headers=cors&skip=Host&Cookie=limit=${limit}&url=${url}`;
    };

  export async function getCKCardPrices(cardName: string) {
    const nonFoilurl = `https://www.cardkingdom.com/catalog/search?search=mtg_advanced&filter%5Bsort%5D=name&filter%5Bsearch%5D=mtg_advanced&filter%5Btab%5D=mtg_card&filter%5Bname%5D=${encodeURIComponent(cardName)}&filter%5Bshow_in_stock%5D=1&filter%5Btype_mode%5D=any&filter%5Bmanaprod_select%5D=any`;
    /* const foilurl = `https://www.cardkingdom.com/catalog/search?search=mtg_advanced&filter%5Bsort%5D=name&filter%5Bsearch%5D=mtg_advanced&filter%5Btab%5D=mtg_foil&filter%5Bname%5D=${encodeURIComponent(cardName)}&filter%5Bshow_in_stock%5D=1`;
    const nonFoilProxyUrl = `https://api.allorigins.win/raw?url=https://www.cardkingdom.com/catalog/search?search=mtg_advanced&filter%5Bsort%5D=name&filter%5Bsearch%5D=mtg_advanced&filter%5Btab%5D=mtg_card&filter%5Bname%5D=Llanowar%20Elves&filter%5Bedition%5D=&filter%5Bformat%5D=&filter%5Bshow_in_stock%5D=1&filter%5Btype_mode%5D=any&filter%5Bcard_type%5D%5B10%5D=&filter%5Bpow1%5D=&filter%5Bpow2%5D=&filter%5Btuf1%5D=&filter%5Btuf2%5D=&filter%5Bconcast1%5D=&filter%5Bconcast2%5D=&filter%5Bprice_op%5D=&filter%5Bprice%5D=&filter%5Boracle_text%5D=&filter%5Bmanaprod_select%5D=any&page=2`;
    const foilProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(foilurl)}`;*/
    const url= `https://www.cardkingdom.com/catalog/search?filter%5Bname%5D=${encodeURIComponent(cardName)}`
    //const foilsUrl= `https://www.cardkingdom.com/catalog/search?filter%5Bname%5D=${encodeURIComponent(cardName)}&filter%5Btab%5D=mtg_foil`
    let cards: Card[] = [];
    try{
        console.log('CALLING: '+ toKometCkUrl(url))
        const nonFoilRawResponse = await fetch(toKometCkUrl(url));
        const nonFoilHtmlStream = nonFoilRawResponse.body as ReadableStream<Uint8Array>;
        const nonFoilHtmlText = await streamToString(nonFoilHtmlStream);
        /*const foilRawResponse = await fetch(toKometCkUrl(foilsUrl));
        const foilHtmlStream = foilRawResponse.body as ReadableStream<Uint8Array>;
        const foilHtmlText = await streamToString(foilHtmlStream);*/

        cards = getCardPricesFromHtmlResponse("", nonFoilHtmlText, cardName);
    } catch (error) {
        console.error(error);
    }
    return cards;
  }