const getPriceSize = (span: HTMLElement | null) => {
    let priceWidth = 62;
    if (span) {
      priceWidth = span?.offsetWidth;
    }
    return priceWidth;
  }

export const getFontSizeForSpan = (span: HTMLElement | null) => {
    const elementWidth = getPriceSize(span);
    const minWidth = 44;
    const maxWidth = 80;
    const minFontSize = 8;
    const maxFontSize = 16;
    let fontSize;
    const isDesktop = window.innerWidth >= 768
    if(isDesktop) {
      return fontSize = 18;
    }
    if (elementWidth >= maxWidth) {
      fontSize = minFontSize;
    } else if (elementWidth <= minWidth) {
      fontSize = maxFontSize;
    } else {
      const widthRange = maxWidth - minWidth;
      const widthDifference = maxWidth - elementWidth;
      const fontSizeDifference = maxFontSize - minFontSize;
      fontSize = minFontSize + (fontSizeDifference * widthDifference) / widthRange;
    }
    return fontSize;
  }