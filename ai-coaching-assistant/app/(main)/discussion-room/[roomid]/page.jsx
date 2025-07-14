"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { getToken } from "@/services/GlobalServices";

let RecordRTC;

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  const [expert, setExpert] = useState();
  const [enabled, setEnabled] = useState(false);
  const recorder = useRef(null);
  const [transcribe, setTranscribe] = useState();
  const socket = useRef(null);
  let silenceTimeout;

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (expert) => expert.name === DiscussionRoomData.expertName
      );
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    console.log("[Step 1] Connect button clicked");
    setEnabled(true);

    try {
      if (typeof window !== "undefined" && typeof navigator !== "undefined") {
        // Step 2: Load RecordRTC
        if (!RecordRTC) {
          console.log("[Step 2] Dynamically importing RecordRTC...");
          const module = await import("recordrtc");
          RecordRTC = module.default || module;
          console.log("[Step 2] RecordRTC imported:", RecordRTC);
        }

        // Step 3: Get AssemblyAI token and connect manually to WebSocket
        console.log("[Step 3] Fetching token...");
        const token = await getToken();
        const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16_000&token=${token}`;

        console.log("[Step 3] Connecting to AssemblyAI WebSocket manually...");
        socket.current = new WebSocket(wsUrl);

        socket.current.onopen = () => {
          console.log("[WebSocket] Connected to AssemblyAI");
        };

        socket.current.onerror = (error) => {
          console.error("[WebSocket] Error:", error);
        };

        socket.current.onmessage = (message) => {
          console.log("[WebSocket] Message received:", message);
          const data = JSON.parse(message.data);
          if (data.text) {
            console.log("[Transcript]", data.text);
            setTranscribe(data.text);
          }
        };

        // Step 4: Request microphone access
        console.log("[Step 4] Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("[Step 4] Microphone access granted");

        // Step 5: Initialize and start RecordRTC
        console.log("[Step 5] Initializing RecordRTC...");
        recorder.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/webm;codecs=pcm",
          recorderType: RecordRTC.StereoAudioRecorder,
          timeSlice: 250,
          desiredSampRate: 16000,
          numberOfAudioChannels: 1,
          bufferSize: 4096,
          audioBitsPerSecond: 128000,
          ondataavailable: async (blob) => {
            if (!socket.current || socket.current.readyState !== 1) {
              console.warn("[WebSocket] Not connected or not ready");
              return;
            }

            clearTimeout(silenceTimeout);

            const buffer = await blob.arrayBuffer();
            console.log("[Step 6] Sending audio buffer to AssemblyAI...");
            socket.current.send(buffer);

            silenceTimeout = setTimeout(() => {
              console.log("Silence detected: User stopped talking");
            }, 2000);
          },
        });

        console.log("[Step 5] Starting recording...");
        recorder.current.startRecording();
        console.log("[Step 5] Recorder started");
      }
    } catch (err) {
      console.error("Error during connection setup:", err);
      setEnabled(false);
    }
  };

  const disconnect = async (e) => {
    e.preventDefault();
    console.log("[Disconnect] Initiated");

    if (socket.current) {
      socket.current.close();
      console.log("[Disconnect] WebSocket closed");
    }

    if (recorder.current) {
      recorder.current.stopRecording(() => {
        recorder.current = null;
        console.log("[Disconnect] Recorder stopped and cleared");
      });
    } else {
      console.warn("[Disconnect] Recorder is already null or not initialized");
    }

    setEnabled(false);
  };

  return (
    <div className="-mt-12">
      <h2 className="text-lg font-bold">
        {DiscussionRoomData?.coachingOption}
      </h2>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="h-[60vh] bg-secondary rounded-4xl flex flex-col items-center justify-center relative">
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt="avatar"
                width={200}
                height={200}
                className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
              />
            )}
            <h2 className="text-gray-500">{expert?.name}</h2>
            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center">
            {!enabled ? (
              <Button onClick={connectToServer}>Connect</Button>
            ) : (
              <Button variant="destructive" onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <div>
          <div className="h-[60vh] bg-secondary rounded-4xl flex flex-col items-center justify-center relative">
            <h2>Chat</h2>
          </div>
          <h2 className="mt-4 text-gray-400 text-smaller">
            At the end of the conversation, we will automatically generate
            feedback/notes
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
