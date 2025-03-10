class PixelPeeper {
  pixels = [];

  constructor() {}

  extractPixels(imageData) {
    // Clear existing pixels if need be
    this.pixels = [];

    for (let i = 0; i < imageData.length; i += 4) {
      // When extracting pixels from an image in a 1D array, the pixel imageData is stored in the order of red, green, blue, alpha
      // So to retrieve the RGBa values for each pixel, we need to access the imageData array at the current index and the next three indices
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      this.pixels.push([r, g, b, a]);
    }
  }

  findLargestColourRange() {
    // Highest possible value for a pixel is 255 and lowest is 0, so flip the values to ensure min and max are set correctly
    let rMin = 255,
      rMax = 0;
    let gMin = 255,
      gMax = 0;
    let bMin = 255,
      bMax = 0;

    // Find min and max for each colour for each pixel
    for (let i = 0; i < this.pixels.length; i++) {
      const [r, g, b] = this.pixels[i];

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

  splitPixelsToBuckets(num_buckets) {
    // Create array to hold our dominant colors
    const dominantColors = [];

    // To ensure there are an even number of pixels in each bucket, calculate the size of each bucket
    const bucketSize = Math.ceil(this.pixels.length / num_buckets);

    const channel = this.findLargestColourRange();
    // Sort the pixels by the colour channel with the largest range
    this.pixels = this.pixels.sort((a, b) => a[channel] - b[channel]);

    // Split the pixels into buckets and find dominant color for each
    for (let i = 0; i < this.pixels.length; i += bucketSize) {
      const bucket = this.pixels.slice(i, i + bucketSize);

      // Calculate the average RGB values for this bucket (dominant color)
      let rSum = 0,
        gSum = 0,
        bSum = 0;

      for (const pixel of bucket) {
        rSum += pixel[0];
        gSum += pixel[1];
        bSum += pixel[2];
      }

      const dominantColor = [
        Math.round(rSum / bucket.length),
        Math.round(gSum / bucket.length),
        Math.round(bSum / bucket.length),
      ];

      dominantColors.push(dominantColor);
    }

    return dominantColors;
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
