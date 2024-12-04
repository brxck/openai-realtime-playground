import { WebSocket } from 'ws';
import { RealtimeAPI } from '@openai/realtime-api-beta';
import { IncomingMessage } from 'http';

export async function openapiRealtimeRelay(
  ws: WebSocket,
  req: IncomingMessage,
) {
  // Original relay used the stateful RealtimeClient, which seems to cause some bugs
  // https://github.com/openai/openai-realtime-console/issues/462
  // https://github.com/openai/openai-realtime-console/issues/474
  const client = new RealtimeAPI({ apiKey: process.env.OPENAI_API_KEY });

  // Relay: OpenAI Realtime API Event -> Browser Event
  client.on('server.*', (event) => {
    //console.log(`Relaying "${event.type}" to Client`);
    ws.send(JSON.stringify(event));
  });
  client.on('close', () => ws.close());

  // Relay: Browser Event -> OpenAI Realtime API Event
  // We need to queue data waiting for the OpenAI connection
  const messageQueue: string[] = [];
  const messageHandler = (data: string) => {
    try {
      const event = JSON.parse(data);
      console.log(`Relaying "${event.type}" to OpenAI`);
      client.send(event.type, event);
    } catch (e) {
      console.error(e.message);
      console.log(`Error parsing event from client: ${data}`);
    }
  };
  ws.on('message', (data: string) => {
    if (!client.isConnected()) {
      messageQueue.push(data);
    } else {
      messageHandler(data);
    }
  });
  ws.on('close', () => client.disconnect());

  // Connect to OpenAI Realtime API
  try {
    console.log(`Connecting to OpenAI...`);
    await client.connect();
  } catch (e) {
    console.log(`Error connecting to OpenAI: ${e.message}`);
    ws.close();
    return;
  }
  console.log(`Connected to OpenAI successfully!`);
  while (messageQueue.length) {
    messageHandler(messageQueue.shift()!);
  }
}
