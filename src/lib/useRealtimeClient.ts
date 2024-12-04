import { useEffect, useRef, useState, useCallback } from 'react';
import {
  FormattedItem,
  RealtimeClient,
  RealtimeEvent,
} from 'openai-realtime-api';
import { WavRecorder } from 'wavtools';
import { useWaveRenderer } from '@/lib/useWaveRenderer';
import { ReactStore } from '@/store';
import { tools } from '@/lib/tools';

const suppressEvents = [
  'conversation.item.input_audio_transcription.completed',
  'response.audio_transcript.done',
  'response.cancel',
  'response.function_call_arguments.done',
  'input_audio_buffer.append',
];

export function useRealtimeClient(startTimeRef: any) {
  const wsUrl =
    process.env.NODE_ENV === 'production'
      ? window.location.origin + '/ws'
      : 'ws://localhost:8081/ws';

  const instructions = ReactStore.useValue('instructions');
  const clientRef = useRef<RealtimeClient>(new RealtimeClient({ url: wsUrl }));
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [items, setItems] = useState<FormattedItem[]>([]);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const {
    clientCanvasRef,
    serverCanvasRef,
    wavRecorderRef,
    wavStreamPlayerRef,
  } = useWaveRenderer();

  const connect = useCallback(async () => {
    if (isConnected) return;

    startTimeRef.current ||= new Date().toISOString();
    if (!clientRef.current.isConnected) await clientRef.current.connect();

    await wavStreamPlayerRef.current.connect();
    await wavRecorderRef.current.begin();
    await wavRecorderRef.current.record((data: any) =>
      clientRef.current.appendInputAudio(data.mono),
    );

    clientRef.current.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
      },
    ]);

    setIsConnected(true);
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await wavRecorderRef.current.end();
      if (clientRef.current.isConnected) clientRef.current.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnection error:', error);
      setIsConnected(false);
    }
  }, []);

  const mute = useCallback(async (muted: boolean) => {
    setIsMuted(muted);
    if (muted) {
      await wavRecorderRef.current.pause();
    } else {
      await wavRecorderRef.current.record();
    }
  }, []);

  useEffect(() => {
    clientRef.current.updateSession({ instructions });
  }, [instructions]);

  // Set up the session, tools, and event listeners
  useEffect(() => {
    clientRef.current.updateSession({
      instructions,
      turn_detection: { type: 'server_vad' },
    });

    tools.forEach((obj) => clientRef.current.addTool(obj.schema, obj.fn));

    clientRef.current.on('error', (error) => {
      console.error(error);
      // @ts-expect-error missing in typed client
      setEvents((prev) => [...prev, error]);
    });

    clientRef.current.on('realtime.event', (event) => {
      if (suppressEvents.includes(event.type as string)) return;
      setEvents((prev) => [...prev, event]);
    });

    clientRef.current.on('conversation.updated', async ({ item, delta }) => {
      const items = clientRef.current.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayerRef.current.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000,
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    clientRef.current.on('conversation.interrupted', async () => {
      const trackSampleOffset = wavStreamPlayerRef.current.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        clientRef.current.cancelResponse(trackId, offset);
      }
    });

    return () => {
      clientRef.current.disconnect();
    };
  }, []);

  return {
    client: clientRef.current,
    isConnected,
    isMuted,
    setIsMuted: mute,
    items,
    events,
    connect,
    disconnect,
    waveRenderer: {
      clientCanvasRef,
      serverCanvasRef,
      wavRecorderRef,
      wavStreamPlayerRef,
    },
  };
}
