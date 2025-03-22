/*
function MedianCut(pixels, depth, maxDepth):
    # Base case: if we've reached the maximum depth or have no pixels
    if depth == maxDepth or pixels.length == 0:
        return [CalculateRepresentativeColour(pixels)]
    
    # Find the color channel with the largest range
    colourRanges = FindcolourRanges(pixels)
    dominantChannel = FindDominantChannel(colourRanges)
    
    # Sort pixels by the dominant channel
    pixels.sort(by: dominantChannel)
    
    # Split the pixels at the median point
    median = pixels.length / 2
    bucket1 = pixels[0:median]
    bucket2 = pixels[median:end]
    
    # Recursively apply median cut to each bucket
    return MedianCut(bucket1, depth+1, maxDepth) + MedianCut(bucket2, depth+1, maxDepth)

function FindcolourRanges(pixels):
    # Initialize min and max values for each channel
    rMin = 255, rMax = 0
    gMin = 255, gMax = 0
    bMin = 255, bMax = 0
    
    # Find min and max values for each channel
    for each pixel in pixels:
        rMin = min(rMin, pixel.r)
        rMax = max(rMax, pixel.r)
        gMin = min(gMin, pixel.g)
        gMax = max(gMax, pixel.g)
        bMin = min(bMin, pixel.b)
        bMax = max(bMax, pixel.b)
    
    # Calculate ranges
    rRange = rMax - rMin
    gRange = gMax - gMin
    bRange = bMax - bMin
    
    return {r: {min: rMin, max: rMax, range: rRange},
            g: {min: gMin, max: gMax, range: gRange},
            b: {min: bMin, max: bMax, range: bRange}}

function FindDominantChannel(colourRanges):
    if colourRanges.r.range >= colourRanges.g.range and colourRanges.r.range >= colourRanges.b.range:
        return 'r'
    if colourRanges.g.range >= colourRanges.r.range and colourRanges.g.range >= colourRanges.b.range:
        return 'g'
    return 'b'

function CalculateRepresentativeColour(pixels):
    # If no pixels, return black
    if pixels.length == 0:
        return [0, 0, 0]
    
    # Option 1: Simple average (can lead to muddy colors)
    rSum = gSum = bSum = 0
    for each pixel in pixels:
        rSum += pixel.r
        gSum += pixel.g
        bSum += pixel.b
    
    return [round(rSum/pixels.length), 
            round(gSum/pixels.length), 
            round(bSum/pixels.length)]
    
    # Option 2: Use most frequent color (better representation)
    # Count frequency of each color
    colorFrequency = {}
    for each pixel in pixels:
        colorKey = pixel.r + "," + pixel.g + "," + pixel.b
        colorFrequency[colorKey] = (colorFrequency[colorKey] || 0) + 1
    
    # Find most frequent color
    mostFrequentColor = FindMostFrequent(colorFrequency)
    return mostFrequentColor

# Main function to get palette
function GetColorPalette(pixels, numColors):
    # Calculate depth needed for desired number of colors
    # 2^depth = numColors, so depth = log2(numColors)
    depth = ceil(log2(numColors))
    
    # Apply median cut algorithm
    palette = MedianCut(pixels, 0, depth)
    
    # Ensure we have exactly the requested number of colors
    if palette.length > numColors:
        return palette[0:numColors]
    
    # If we have fewer colors than requested, duplicate some
    while palette.length < numColors:
        palette.push(palette[palette.length % palette.length])
    
    return palette
*/

class PixelPeeper {
  pixels = [];

  constructor() {}

  extractPixels(imageData) {
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
    mostFrequent = Object.entries(frequencies).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    return mostFrequent
  }

  CalculateRepresentativeColour(pixels){
    if (pixels.length == 0) {
      return [0,0,0]
    }

    colourFrequencies = {}

    for(pixel in pixels){
      // Key will be for instance "125,52,255"
      colourKey = pixel.r + "," + pixel.g + "," + pixel.b
      // Increment on if colour key is present
      colourFrequencies[colourKey] = (colourFrequencies[colourKey] || 0) + 1
    }

    mostFrequentColour = this.FindMostFrequent(colourFrequencies)
    return mostFrequentColour
  }

  
  MedianCut(pixels, depth, maxDepth){
    /*
    # Base case: if we've reached the maximum depth or have no pixels
    if depth == maxDepth or pixels.length == 0:
        return [CalculateRepresentativeColour(pixels)]
    
    # Find the color channel with the largest range
    colourRanges = FindcolourRanges(pixels)
    dominantChannel = FindDominantChannel(colourRanges)
    
    # Sort pixels by the dominant channel
    pixels.sort(by: dominantChannel)
    
    # Split the pixels at the median point
    median = pixels.length / 2
    bucket1 = pixels[0:median]
    bucket2 = pixels[median:end]
    
    # Recursively apply median cut to each bucket
    return MedianCut(bucket1, depth+1, maxDepth) + MedianCut(bucket2, depth+1, maxDepth)
    */

    // Final result of recursion branch, return colour
    if (depth == maxDepth || pixels.length == 0){
      return [this.CalculateRepresentativeColour(pixels)]
    }

    // Find the colour channel with the largest range
    colourRanges = this.FindColourRanges(pixels)
    dominantChannel = this.FindDominantChannel(colourRanges)

    // Sort pixels by the dominant colour channel
    

  }
  
  GetColorPalette(num_colours){

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
