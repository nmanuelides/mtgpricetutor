import ReactGA from 'react-ga';

export const useTracking = () => {
    const trackSearchEvent = (searchTerm: string) => {
        ReactGA.event({
          category: 'Search',
          action: 'Submit',
          label: searchTerm,
        });
      };

    return {trackSearchEvent};
}