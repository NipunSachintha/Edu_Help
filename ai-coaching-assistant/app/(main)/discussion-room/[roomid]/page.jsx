"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CoachingExpert } from '@/services/Options';
import Image from 'next/image';
import { UserButton } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { RealtimeTranscriber } from 'assemblyai';
import { getToken } from '@/services/GlobalServices';

// Correct dynamic import of RecordRTC (as a library, not a React component)
let RecordRTC;

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
  const [expert, setExpert] = useState();
  const [enabled, setEnabled] = useState(false);
  const recorder = useRef(null);
  const [transcribe, setTranscribe] = useState();
  let silenceTimeout;
  const realtimeTranscriber = useRef(null);
  let texts = {};

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(expert => expert.name === DiscussionRoomData.expertName);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    setEnabled(true);

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // Dynamically import RecordRTC only when needed
      if (!RecordRTC) {
        const module = await import('recordrtc');
        RecordRTC = module.default || module;
      }

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=pcm',
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              clearTimeout(silenceTimeout);
              const buffer = await blob.arrayBuffer();
              console.log(buffer);
              silenceTimeout = setTimeout(() => {
                console.log('User stopped talking');
              }, 2000);
            },
          });

          console.log("Recorder instance:", recorder.current);
          recorder.current.startRecording();
        })
        .catch((err) => console.error("Microphone access error:", err));
    }
  };

  const disconnect = async (e) => {
    e.preventDefault();

    if (realtimeTranscriber.current) {
      await realtimeTranscriber.current.close();
      console.log('Disconnected from AssemblyAI Realtime Transcriber');
    }

    if (recorder.current) {
      recorder.current.pauseRecording();
      recorder.current = null;
      console.log('Recorder paused and set to null');
    } else {
      console.warn('Recorder is already null or not initialized');
    }

    setEnabled(false);
  };

  return (
    <div className='-mt-12'>
      <h2 className='text-lg font-bold'>
        {DiscussionRoomData?.coachingOption}
      </h2>

      <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10'>
        <div className='lg:col-span-2'>
          <div className='h-[60vh] bg-secondary rounded-4xl flex flex-col items-center justify-center relative'>
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt='avatar'
                width={200}
                height={200}
                className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
              />
            )}
            <h2 className='text-gray-500'>{expert?.name}</h2>
            <div className='p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10'>
              <UserButton />
            </div>
          </div>

          <div className='mt-5 flex items-center justify-center'>
            {!enabled
              ? <Button onClick={connectToServer}>Connect</Button>
              : <Button variant="destructive" onClick={disconnect}>Disconnect</Button>
            }
          </div>
        </div>

        <div>
          <div className='h-[60vh] bg-secondary rounded-4xl flex flex-col items-center justify-center relative'>
            <h2>Chat</h2>
          </div>
          <h2 className='mt-4 text-gray-400 text-smaller'>
            At the end of the conversation, we will automatically generate feedback/notes
          </h2>
        </div>
      </div>

      <div>
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
}

export default DiscussionRoom;
