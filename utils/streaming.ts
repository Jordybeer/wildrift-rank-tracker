import { createParser } from 'eventsource-parser';

// Utility for decoding Streaming API responses
export async function streamAsyncIterable(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let buffer = '';

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    buffer += decoder.decode(value, { stream: true });

    const { event, data } = createParser().parse(buffer);
    if (event === 'data') {
      buffer = data;
      const lines = buffer.split('\n');
      const parsed = lines
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => JSON.parse(line));
      for (const part of parsed) {
        yield part;
      }
    }
  }
}