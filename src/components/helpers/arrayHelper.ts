import { Card } from "../../entities/cards";


export function mergeArrays(firstArray: Card[], secondArray: Card[]): Card[] {
    const mergedCardsArray: Card[] = [...firstArray]; // Create a copy of the first array

    for (const secondArrayCard of secondArray) {
      const matchingCardIndex = mergedCardsArray.findIndex(
        (firstArrayCard) =>{
            return firstArrayCard.collectorNumber === secondArrayCard.collectorNumber && firstArrayCard.foil === secondArrayCard.foil
        }
      );

      if (matchingCardIndex !== -1) {
        // Add properties into the matching card
        mergedCardsArray[matchingCardIndex].ckPrice = secondArrayCard.ckPrice
        const scgPrice = mergedCardsArray[matchingCardIndex].scgPrice;
        if(scgPrice && scgPrice === '0') {
            mergedCardsArray[matchingCardIndex].priceSource = secondArrayCard.priceSource;
        }
      }
    }

    return mergedCardsArray;
  }
