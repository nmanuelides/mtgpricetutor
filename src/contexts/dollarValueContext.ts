import { createContext } from 'react';
import { DOLAR_PIRULO } from '../dolar-pirulo';

type DollarValueState = {
    savedDollarValue: number;
    setSavedDollarValue: React.Dispatch<React.SetStateAction<number>>;
};

export const DollarValueContext = createContext<DollarValueState>({
    savedDollarValue: DOLAR_PIRULO,
    setSavedDollarValue: () => {}
});