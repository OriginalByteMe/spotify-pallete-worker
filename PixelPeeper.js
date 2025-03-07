class PixelPeeper {
  constructor() {}

  extractPixels(imageData) {
    const pixels = [];
    const { data, width, height } = imageData;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      pixels.push([r, g, b, a]);
    }

    return pixels;
  }

  findLargestColourRange(pixels) {
    // Highest possible value for a pixel is 255 and lowest is 0, so flip the values to ensure min and max are set correctly
    let rMin = 255,
      rMax = 0;
    let gMin = 255,
      gMax = 0;
    let bMin = 255,
      bMax = 0;

    // Find min and max for each colour for each pixel
    for (let i = 0; i < pixels.length; i++) {
      const [r, g, b] = pixels[i];

      rMin = Math.min(rMin, r);
      rMax = Math.max(rMax, r);
      gMin = Math.min(gMin, g);
      gMax = Math.max(gMax, g);
      bMin = Math.min(bMin, b);
      bMax = Math.max(bMax, b);
    }

    // Retrieve range after finding min and max for each colour for each pixel
    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    // Find the largest range out of the three
    const maxRange = Math.max(rRange, gRange, bRange);

    // Return 0 for red, 1 for green, 2 for blue
    if (maxRange === rRange) return 0;
    if (maxRange === gRange) return 1;
    if (maxRange === bRange) return 2;
  }

  splitPixelsToBuckets(pixels, num_buckets) {
    const buckets = [];
    // To ensure there are an even number of pixels in each bucket, calculate the size of each bucket
    const bucketSize = Math.ceil(pixels.length / num_buckets);

    const channel = findLargestColourRange(pixels);
    // Sort the pixels by the colour channel with the largest range
    pixels = pixels.sort((a, b) => a[channel] - b[channel]);
    // Split the pixels into buckets
    for (let i = 0; i < pixels.length; i += bucketSize) {
      buckets.push(pixels.slice(i, i + bucketSize));
    }

    return buckets;
  }

  async checkAndSeeTheImageData(imageData) {
    console.log(
      "🚀 ~ PixelPeeper ~ checkAndSeeTheImageData ~ imageData:",
      imageData
    );
    const { data, width, height } = imageData;
    console.log("🚀 ~ PixelPeeper ~ checkAndSeeTheImageData ~ data:", data);
  }
}

export default PixelPeeper;
