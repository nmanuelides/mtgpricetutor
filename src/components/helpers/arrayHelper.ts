import { Card } from "../../entities/cards";


export function mergeCardsArrays(scgArray: Card[], ckArray: Card[]): Card[] {
    const mergedCardsArray: Card[] = [...scgArray]; // Create a copy of scg array
    const scgCardsMap: { [key: string]: Card } = {};

    for (const scgCard of mergedCardsArray) {
      if (scgCard.stock === 0) {
        const key = getKey(scgCard);
        scgCardsMap[key] = scgCard;
      }
    }

    for (const ckArrayCard of ckArray) {
      const matchingCardIndex = mergedCardsArray.findIndex((scgArrayCard) => {
        return (
          scgArrayCard.stock === 0 &&
          scgArrayCard.collectorNumber === ckArrayCard.collectorNumber &&
          scgArrayCard.foil === ckArrayCard.foil &&
          scgArrayCard.setName === ckArrayCard.setName
        );
      });

      if (matchingCardIndex !== -1) {
        // Add properties into the matching card
        mergedCardsArray[matchingCardIndex].ckPrice = ckArrayCard.ckPrice;
        mergedCardsArray[matchingCardIndex].price = ckArrayCard.ckPrice;
        mergedCardsArray[matchingCardIndex].priceSource = ckArrayCard.priceSource;
      }
    }
    for (const key in scgCardsMap) {
        if (!isKeyMatchedWithCKArray(key, ckArray)) {
          // Set lastPrice for the not matching card
          const scgCard = scgCardsMap[key];
          scgCard.lastPrice = scgCard.scgPrice;
        }
      }
    return mergedCardsArray;
}

  // Helper function to generate a unique key for a card
function getKey(card: Card): string {
    return `${card.collectorNumber}-${card.foil}-${card.setName}`;
}

// Helper function to check if key is matched with ckArray
function isKeyMatchedWithCKArray(key: string, ckArray: Card[]): boolean {
    for (const ckCard of ckArray) {
      if (key === getKey(ckCard)) {
        return true;
      }
    }
    return false;
}