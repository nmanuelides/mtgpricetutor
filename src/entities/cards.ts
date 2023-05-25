export interface Card {
    image?: string;
    collectorNumber: string;
    setName: string;
    scgPrice?: string;
    ckPrice?: string;
    borderColor?: string;
    foil: boolean;
    priceSource: 'SCG' | 'CK';
}