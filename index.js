import PixelPeeper from "./PixelPeeper.js";
var jpeg = require('jpeg-js')
var png = require('png-js');

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Get bucket size dynamically from URl, default is 5
    const bucketSize = parseInt(url.searchParams.get('buckets') || '5', 10);

    if (request.method === 'GET' && path === '/api/health') {
      return new Response('OK', { status: 200 })
    }

    if (request.method === 'POST' && path === '/api/palette') {
      const url = await request.text();
      
      // Fetch the image directly
      const imageResponse = await fetch(url);
      if (!imageResponse.ok) {
        return new Response(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`, { status: 500 });
      }
      
      const contentType = imageResponse.headers.get('content-type');
      const arrayBuffer = await imageResponse.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const peeper = new PixelPeeper();
      let palette = [];
      if (contentType.includes('image/jpeg')) {
        try {
          const imageData = jpeg.decode(uint8Array, { useTArray: true });
          peeper.ExtractPixels(imageData);
          palette = peeper.GetColorPalette(bucketSize);
          return new Response(JSON.stringify(palette), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response('Error processing JPEG: ' + e.message, { status: 500 });
        }
      }
      
      if (contentType.includes('image/png')) {
        try {
          const imageData = png.decode(uint8Array);
          peeper.ExtractPixels(imageData);
          palette = peeper.GetColorPalette(bucketSize);
          return new Response(JSON.stringify(palette), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response('Error in PNG processing: ' + e.message, { status: 500 });
        }
      }
      
      return new Response('Unsupported image type: ' + contentType, { status: 400 });
    }

    if (request.method === 'POST' && path === '/api/data_inspect') {
      const url = await request.text();
      
      // Fetch the image
      const imageResponse = await fetch(url);
      if (!imageResponse.ok) {
        return new Response(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`, { status: 500 });
      }
      
      const contentType = imageResponse.headers.get('content-type');
      const arrayBuffer = await imageResponse.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const imageData = jpeg.decode(arrayBuffer);
      
      // Create a PixelPeeper instance to get detailed color information
      const peeper = new PixelPeeper();
      try {
        const data = await peeper.checkAndSeeTheImageData(uint8Array);
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response('Error in image analysis: ' + e.message, { status: 500 });
      }
    }

    return new Response('not found', { status: 404 })
  } catch (err) {
    console.log(err)
    return new Response(err.stack, { status: 500 })
  }
}

function meanRgba(w, h, matrix) {
  const size = w * h
  const rgb = [0, 0, 0]
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var idx = (w * y + x) << 2
      rgb[0] += matrix[idx]
      rgb[1] += matrix[idx + 1]
      rgb[2] += matrix[idx + 2]
    }
  }

  return [Math.floor(rgb[0] / size), Math.floor(rgb[1] / size), Math.floor(rgb[2] / size)]
}

export default {
  fetch: handleRequest
}