const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

export async function getPixelColor(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    if (response.ok) {
    const blob = await response.blob();

    const image = new Image();
    image.src = URL.createObjectURL(blob);

    await new Promise((resolve) => {
        image.onload = resolve;
    });

    const x: number = 183;
    const y: number = image.height - 2;
    canvas.width = image.width;
    canvas.height = image.height;

    canvas.setAttribute('willReadFrequently', 'true');

    if (context) {
        context.drawImage(image, 0, 0);
        const pixelData = context.getImageData(x, y, 1, 1).data;
        const hexValue = "#" + ((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1);

        URL.revokeObjectURL(image.src);

        return hexValue;
    } else {
        throw new Error("Could not get canvas context");
    }
  } else {
    return '';
  }
}

export const getFontColorForBackground = (backgroundColor: string) => {
    const hex = backgroundColor.slice(1); // remove the '#' character from the color string
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; // calculate lightness using the relative luminance formula
    if (lightness < 0.5) {
      return "#ffffff"; // use white font color for dark background
    } else {
      return "#000000"; // use black font color for light background
    }
  }
