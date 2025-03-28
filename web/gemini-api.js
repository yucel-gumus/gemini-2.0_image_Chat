/**
 * Gemini API interface
 * 
 * Handles communication with the Gemini API through our backend.
 * Provides streaming functionality for real-time responses.
 */

/**
 * Calls the given Gemini model with the provided image and/or text parts.
 * Returns a generator function that streams the API response.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.model - The Gemini model to use (default: 'gemini-1.5-flash')
 * @param {Array} options.contents - The contents array containing user messages
 * @returns {AsyncGenerator} A generator yielding text chunks from the API response
 */
export async function* streamGemini({
  model = 'gemini-1.5-flash',
  contents = [],
} = {}) {
  try {
    // Send the request to the Python backend
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, contents })
    });
    
    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    // Stream the response chunks
    yield* streamResponseChunks(response);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

/**
 * A helper that streams text output chunks from a fetch() response.
 * @param {Response} response - The fetch response object with streaming body
 * @yields {string} Text chunks from the response
 */
async function* streamResponseChunks(response) {
  let buffer = '';
  const CHUNK_SEPARATOR = '\n\n';

  /**
   * Process buffer to extract complete chunks
   * @param {boolean} streamDone - Whether the stream is done
   */
  let processBuffer = async function* (streamDone = false) {
    while (true) {
      let flush = false;
      let chunkSeparatorIndex = buffer.indexOf(CHUNK_SEPARATOR);
      
      if (streamDone && chunkSeparatorIndex < 0) {
        flush = true;
        chunkSeparatorIndex = buffer.length;
      }
      
      if (chunkSeparatorIndex < 0) {
        break;
      }

      let chunk = buffer.substring(0, chunkSeparatorIndex);
      buffer = buffer.substring(chunkSeparatorIndex + CHUNK_SEPARATOR.length);
      chunk = chunk.replace(/^data:\s*/, '').trim();
      
      if (!chunk) {
        if (flush) break;
        continue;
      }
      
      try {
        let { error, text } = JSON.parse(chunk);
        if (error) {
          console.error("Error in API response:", error);
          throw new Error(error?.message || JSON.stringify(error));
        }
        yield text;
      } catch (parseError) {
        console.error("Error parsing chunk:", parseError);
        throw new Error("Invalid response format from API");
      }
      
      if (flush) break;
    }
  };

  // Read from stream and process chunks
  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);
      yield* processBuffer();
    }
  } catch (error) {
    console.error("Error reading stream:", error);
    throw error;
  } finally {
    reader.releaseLock();
  }

  // Process any remaining data
  yield* processBuffer(true);
}
