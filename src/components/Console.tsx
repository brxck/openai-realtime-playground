import { useRef, useState } from 'react';

import { ExtRealtimeEvent, useRealtimeClient } from '@/lib/useRealtimeClient';
import { useWaveRenderer } from '@/lib/useWaveRenderer';
import { useUIScroller } from '@/lib/useUIScroller';
import { formatTimestamp } from '@/lib/format';
import { tools } from '@/lib/tools';
import { Button } from './ui/button';

const instructions = `System settings:
Tool use: enabled.

Instructions:
- You are an AI agent responsible for helping test realtime voice capabilities
- Please make sure to respond with a helpful voice via audio
- Speak fast, 2x speed.
- Be kind, helpful, and curteous
- It is okay to ask the user short followup or clarification questions
- Use tools and functions you have available liberally, it is part of the training apparatus
- You have access to the set_memory tool with some defined schemas you can add or delete to. Try not to add unnecessary keys.
- Be open to exploration and conversation

Personality:
- Be snarky and sarcastic
- Try speaking quickly as if excited
`;

export function Console() {
  const startTimeRef = useRef<string>(new Date().toISOString());

  const [realtimeEvents, setRealtimeEvents] = useState<ExtRealtimeEvent[]>([]);

  const { eventsScrollRef } = useUIScroller(realtimeEvents);
  const {
    clientCanvasRef,
    serverCanvasRef,
    wavRecorderRef,
    wavStreamPlayerRef,
  } = useWaveRenderer();

  const {
    client,
    isConnected,
    isMuted,
    setIsMuted,
    connectConversation,
    disconnectConversation,
  } = useRealtimeClient(
    startTimeRef,
    setRealtimeEvents,
    wavStreamPlayerRef,
    wavRecorderRef,
    instructions,
    tools
  );

  return (
    <div className="w-full p-4 overflow-auto md:w-96">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={isConnected ? 'destructive' : 'default'}
          onClick={isConnected ? disconnectConversation : connectConversation}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
        {isConnected && (
          <>
            <Button variant="outline" onClick={() => client.createResponse()}>
              Force Reply
            </Button>
            <Button
              variant={isMuted ? 'default' : 'outline'}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </Button>
          </>
        )}
      </div>
      <div className="mb-4">
        <canvas
          ref={clientCanvasRef}
          className="w-full h-12 rounded bg-gray-50"
        />
      </div>
      <div className="mb-4">
        <canvas
          ref={serverCanvasRef}
          className="w-full h-12 rounded bg-gray-50"
        />
      </div>
      <div ref={eventsScrollRef} className="h-full mt-2 space-y-2">
        {realtimeEvents.map((event, i) => (
          <div
            key={i}
            className={`text-xs rounded ${
              event.error
                ? 'bg-red-50'
                : event.source === 'server'
                ? 'bg-green-50'
                : 'bg-gray-50'
            }`}
          >
            <details className="text-xs">
              <summary className="flex items-center justify-between p-2">
                <span>
                  {('transcript' in event.event && (
                    <p>{'"' + event.event.transcript + '"'}</p>
                  )) ||
                    (event.event.type ===
                      'response.function_call_arguments.done' &&
                      'name' in event.event &&
                      'arguments' in event.event &&
                      event.event.name + '(' + event.event.arguments + ')') || (
                      <span className="font-mono">{event.event.type}</span>
                    ) ||
                    JSON.stringify(event.event)}
                </span>
                <span>
                  +{formatTimestamp(startTimeRef.current, event.time) + ' '}
                </span>
              </summary>
              <pre className="p-2 pr-0 overflow-auto whitespace-pre max-h-96">
                {JSON.stringify(event.event, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
