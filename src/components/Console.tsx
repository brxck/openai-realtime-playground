import { useRef, useState } from 'react';

import { ExtRealtimeEvent, useRealtimeClient } from '@/lib/useRealtimeClient';
import { useWaveRenderer } from '@/lib/useWaveRenderer';
import { useUIScroller } from '@/lib/useUIScroller';
import { formatTimestamp } from '@/lib/format';
import { tools } from '@/lib/tools';

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
      <div className="flex items-center mb-4 space-x-4">
        <button
          onClick={isConnected ? disconnectConversation : connectConversation}
          className={`flex items-center gap-2 font-mono text-xs font-normal border-none min-h-[42px] transition-all duration-100 outline-none disabled:text-[#999] enabled:cursor-pointer px-4 py-2 rounded-md ${
            isConnected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
        {isConnected && (
          <span className="flex space-x-2">
            <button
              className="flex items-center gap-2 font-mono text-xs font-normal border-none rounded-[1000px] px-6 min-h-[42px] transition-all duration-100 outline-none disabled:text-[#999] enabled:cursor-pointer bg-[#101010] text-[#ececf1] hover:enabled:bg-[#404040]"
              onClick={() => client.createResponse()}
            >
              Force Reply
            </button>
            <button
              className={`flex items-center gap-2 font-mono text-xs font-normal border-none rounded-[1000px] px-6 min-h-[42px] transition-all duration-100 outline-none disabled:text-[#999] enabled:cursor-pointer ${
                isMuted
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-[#101010] text-[#ececf1] hover:enabled:bg-[#404040]'
              }`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </span>
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
      <div
        ref={eventsScrollRef}
        className="h-full mt-2 space-y-2 overflow-auto"
      >
        {realtimeEvents.map((event, i) => (
          <div
            key={i}
            className={`text-xs p-2 rounded ${
              event.error
                ? 'bg-red-50'
                : event.source === 'server'
                ? 'bg-green-50'
                : 'bg-blue-50'
            }`}
          >
            <details className="flex items-center justify-between">
              <summary className="font-mono">
                {formatTimestamp(startTimeRef.current, event.time) + ' '}
                <span className="text-xs text-gray-600">
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
                    // console.log(event.event) ||
                    JSON.stringify(event.event)}
                </span>
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap max-h-40">
                {JSON.stringify(event.event, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
