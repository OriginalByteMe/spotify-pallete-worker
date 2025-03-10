import { PNG } from 'pngjs/browser';
import str from 'string-to-stream';
import PixelPeeper from "./PixelPeeper.js";
var jpeg = require('jpeg-js')

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET' && path === '/api/health') {
      return new Response('OK', { status: 200 })
    }

    if (request.method === 'POST' && path === '/api/pallete') {
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
      let pallete = [];
      if (contentType.includes('image/jpeg')) {
        try {
          peeper.extractPixels(uint8Array);
          pallete = peeper.splitPixelsToBuckets(5);
          return new Response(JSON.stringify(pallete), {
            headers: { 'Content-Type': 'application/json' }
          });
          // var rawImageData = jpeg.decode(arrayBuffer);
          // return new Response(JSON.stringify(meanRgba(rawImageData.width, rawImageData.height, rawImageData.data)));
        } catch (e) {
          return new Response('Error processing JPEG: ' + e.message, { status: 500 });
        }
      }
      
      if (contentType.includes('image/png')) {
        try {
            peeper.extractPixels(uint8Array);
            pallete = peeper.splitPixelsToBuckets(5);
            return new Response(JSON.stringify(pallete), {
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