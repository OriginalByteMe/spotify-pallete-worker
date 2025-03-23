class PixelPeeper {
  pixels = [];

  constructor() {}

  ExtractPixels(imageData) {
    // Clear existing pixels if need be
    this.pixels = [];

    // Check if imageData is a decoded image object (from jpeg-js)
    if (imageData.data && imageData.width && imageData.height) {
      // Use the decoded data
      const pixelData = imageData.data;
      
      for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        const a = pixelData[i + 3];
        
        // Only include pixels with sufficient opacity
        if (a >= 125) {
          this.pixels.push([r, g, b]);
        }
      }
    } else {
      // Assume it's raw pixel data (1D array of RGBA values)
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        // Only include pixels with sufficient opacity
        if (a >= 125) {
          this.pixels.push([r, g, b]);
        }
      }
    }
  }


  FindColourRanges(pixels) {
    // Initialize min and max values for RGB
    let rMin = 255, rMax = 0;
    let gMin = 255, gMax = 0;
    let bMin = 255, bMax = 0;

    // Find min and max for each color channel
    for (const pixel of pixels) {
      const [r, g, b] = pixel;
      
      rMin = Math.min(rMin, r);
      rMax = Math.max(rMax, r);
      gMin = Math.min(gMin, g);
      gMax = Math.max(gMax, g);
      bMin = Math.min(bMin, b);
      bMax = Math.max(bMax, b);
    }

    // Calculate ranges
    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    return {
      r: { min: rMin, max: rMax, range: rRange },
      g: { min: gMin, max: gMax, range: gRange },
      b: { min: bMin, max: bMax, range: bRange }
    };
  }

  FindDominantChannel(colourRanges) {
    if (colourRanges.r.range >= colourRanges.g.range && colourRanges.r.range >= colourRanges.b.range){
      return 'r'
    }

    if (colourRanges.g.range >= colourRanges.r.range && colourRanges.g.range >= colourRanges.b.range){
      return 'g'
    }
    return 'b'
  }

  FindMostFrequent(frequencies){
    // Convert object to array, reduce compare each value (second element of each) in terms of size and return the largest
    const mostFrequent = Object.entries(frequencies).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    return mostFrequent
  }

  CalculateRepresentativeColour(pixels){
    if (pixels.length == 0) {
      return [0,0,0]
    }

    let colourFrequencies = {}
    for(const pixel of pixels){
      // Key will be for instance "125,52,255"
      const colourKey = pixel[0] + "," + pixel[1] + "," + pixel[2]
      // Increment on if colour key is present
      colourFrequencies[colourKey] = (colourFrequencies[colourKey] || 0) + 1
    }

    const mostFrequentColour = this.FindMostFrequent(colourFrequencies)
    return mostFrequentColour
  }

  
  MedianCut(pixels, depth, maxDepth){
    // Final result of recursion branch, return colour
    if (depth == maxDepth || pixels.length == 0){
      return [this.CalculateRepresentativeColour(pixels)]
    }

    // Find the colour channel with the largest range
    const colourRanges = this.FindColourRanges(pixels)
    const dominantChannel = this.FindDominantChannel(colourRanges)

    // Sort pixels by the dominant colour channel
    switch(dominantChannel){
      case "r":
        pixels.sort((a,b) => a[0] - b[0])
        break
      case "g": 
        pixels.sort((a,b) => a[1] - b[1])
        break
      case "b":
        pixels.sort((a,b) => a[2] - b[2])
        break
    }

    // Split the pixels at the median point
    const median = Math.floor(pixels.length / 2)
    const bucket1 = pixels.slice(0,median)
    const bucket2 = pixels.slice(median)

    // Recursively apply median cut to each bucket
    return this.MedianCut(bucket1, depth+1, maxDepth).concat(this.MedianCut(bucket2, depth+1, maxDepth))

  }
  
  GetColorPalette(numColours){

    // 2^depth = numColours, so depth = log2(numColours)
    const depth = Math.ceil(Math.log2(numColours))

    // Apply median cut algorithm
    const palette = this.MedianCut(this.pixels, 0, depth)


    // # Ensure we have exactly the requested number of colors
    if (palette.length > numColours){
      return palette.slice(0,numColours)
    }
    
    // # If we have fewer colors than requested, duplicate some
    while (palette.length < numColours){
      palette.push(palette[palette.length % palette.length])
    }
    
    return palette

  }

  async checkAndSeeTheImageData(imageData) {
    console.log(
      "🚀 ~ PixelPeeper ~ checkAndSeeTheImageData ~ imageData:",
      imageData
    );
    const { data, width, height } = imageData;
    console.log("🚀 ~ PixelPeeper ~ checkAndSeeTheImageData ~ data:", data);

    this.extractPixels(imageData);
    console.log(this.pixels)
  }
}

export default PixelPeeper;
