import { useRef } from 'react';

import { useRealtimeClient } from '@/lib/useRealtimeClient';
import { useScrollToBottom } from '@/lib/useScrollToBottom';
import { formatTimestamp } from '@/lib/format';
import { Button } from './ui/button';
import { Instructions } from '@/components/Instructions';

export function Console() {
  const startTimeRef = useRef<string>(new Date().toISOString());

  const {
    client,
    isConnected,
    isMuted,
    setIsMuted,
    connect,
    disconnect,
    events,
    items,
    waveRenderer: { clientCanvasRef, serverCanvasRef },
  } = useRealtimeClient(startTimeRef);

  const { scrollRef: eventsScrollRef } = useScrollToBottom([events]);
  const { scrollRef: itemsScrollRef } = useScrollToBottom([items]);

  return (
    <div className="w-full p-4 overflow-auto md:w-96">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={isConnected ? 'destructive' : 'default'}
          onClick={isConnected ? disconnect : connect}
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
      <Instructions />

      <details className="font-semibold text-sm my-2" open>
        <summary>Conversation</summary>
        <div ref={itemsScrollRef} className="text-xs max-h-96 overflow-auto">
          {items.map((item) => {
            return (
              <div className="border-gray-200 border-b py-2" key={item.id}>
                <div className="font-semibold">
                  {(item.role as string) || item.type}
                </div>
                <div>
                  {/* tool response */}
                  {item.type === 'function_call_output' && (
                    <div>{item.formatted.output}</div>
                  )}
                  {/* tool call */}
                  {!!item.formatted.tool && (
                    <div>
                      {item.formatted.tool.name}({item.formatted.tool.arguments}
                      )
                    </div>
                  )}
                  {!item.formatted.tool && item.role === 'user' && (
                    <div>
                      {item.formatted.transcript ||
                        (item.formatted.audio?.length
                          ? '(awaiting transcript)'
                          : item.formatted.text || '(item sent)')}
                    </div>
                  )}
                  {!item.formatted.tool && item.role === 'assistant' && (
                    <div>
                      {item.formatted.transcript ||
                        item.formatted.text ||
                        '(truncated)'}
                    </div>
                  )}
                  {/* {item.formatted.file && (
                  <audio src={item.formatted.file.url} controls />
                )} */}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      <details className="font-semibold text-sm my-2">
        <summary>Events</summary>
        <div
          ref={eventsScrollRef}
          className="mt-2 space-y-2 max-h-96 overflow-auto"
        >
          {events.map((event, i) => {
            return (
              <div
                key={i}
                className={`text-xs rounded border ${
                  'error' in event || 'error' in event.event
                    ? 'bg-red-50'
                    : event.source === 'server'
                      ? 'bg-green-50'
                      : 'bg-white'
                }`}
              >
                <details className="text-xs">
                  <summary className="flex items-center p-2">
                    <span>
                      {('transcript' in event.event && (
                        <p>{'"' + event.event.transcript + '"'}</p>
                      )) ||
                        (event.event.type ===
                          'response.function_call_arguments.done' &&
                          'name' in event.event &&
                          'arguments' in event.event &&
                          event.event.name +
                            '(' +
                            event.event.arguments +
                            ')') || (
                          <span className="font-mono">{event.event.type}</span>
                        ) ||
                        JSON.stringify(event.event)}
                    </span>
                    <span className="ml-auto">
                      +{formatTimestamp(startTimeRef.current, event.time) + ' '}
                    </span>
                  </summary>
                  <pre className="p-2 pr-0 overflow-auto whitespace-pre max-h-96">
                    {JSON.stringify(event.event, null, 2)}
                  </pre>
                </details>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
