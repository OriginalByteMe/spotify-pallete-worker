import { PNG } from 'pngjs/browser'
import str from 'string-to-stream'
var jpeg = require('jpeg-js')

function base64ToArrayBuffer(base64) {
  var binary_string = atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

async function handleRequest(request) {
  try {
    if (request.method === 'GET') {
      return new Response('OK', { status: 200 })
    }

    if (request.method === 'POST') {
      const url = await request.text();
      
      // Fetch the image directly
      const imageResponse = await fetch(url);
      if (!imageResponse.ok) {
        return new Response(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`, { status: 500 });
      }
      
      const contentType = imageResponse.headers.get('content-type');
      const arrayBuffer = await imageResponse.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      if (contentType.includes('image/jpeg')) {
        try {
          var rawImageData = jpeg.decode(arrayBuffer);
          return new Response(JSON.stringify(meanRgba(rawImageData.width, rawImageData.height, rawImageData.data)));
        } catch (e) {
          return new Response('Error processing JPEG: ' + e.message, { status: 500 });
        }
      }
      
      if (contentType.includes('image/png')) {
        try {
          return await new Promise((ok, fail) => {
            str(uint8Array)
              .pipe(
                new PNG({
                  filterType: 4,
                })
              )
              .on('parsed', function() {
                ok(new Response(JSON.stringify(meanRgba(this.width, this.height, this.data))));
              })
              .on('error', function(err) {
                fail(new Response('Error processing PNG: ' + err.message, { status: 500 }));
              });
          });
        } catch (e) {
          return new Response('Error in PNG processing: ' + e.message, { status: 500 });
        }
      }
      
      return new Response('Unsupported image type: ' + contentType, { status: 400 });
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