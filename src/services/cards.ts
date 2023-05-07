export interface Card {
    multiverseId: string;
    mtgoId:string | undefined;
    images: {
        small: string;
        normal: string;
        large: string;
        png:string;
        art_crop:string;
        border_crop:string;
    };
    prices: {
        usd: string;
        usd_foil: string;
    }
    borderColor: string;
}

export async function fetchCards(cardName: string) {
    const url= `https://api.scryfall.com/cards/autocomplete?q=${cardName}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  export async function fetchCardByName(cardName: string) {
    const url = `https://api.scryfall.com/cards/search?q=!"${cardName}"&unique=prints`;
    console.log("Calling: " + url);
    const response = await fetch(url, { mode: 'cors' });
    const data = await response.json();
    const results: Card[] = [];
    data.data.map((rawCard:any) => {
        const card = {
            multiverseId: rawCard.multiverse_id?.[0],
            mtgoId: rawCard.mtgo_id,
            images:{...rawCard.image_uris},
            prices:{...rawCard.prices},
            borderColor: rawCard.border_color
        }
        if(rawCard.prices.usd) results.push(card);
    })
    return results;
  }
