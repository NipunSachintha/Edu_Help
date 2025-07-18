"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { AIModel, getToken } from "@/services/GlobalServices";
import { Loader2Icon } from "lucide-react";
import ChatBox from "./_components/ChatBox";

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
  const [conversation, setConversation] = useState([{
      role: "assistant",
      content: "Hello"
    },
    {
      role: "user",
      content: "Hello"
    }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (expert) => expert.name === DiscussionRoomData.expertName
      );
      setExpert(Expert);
    }
    console.log("[DiscussionRoomData]", DiscussionRoomData);  
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    console.log("[Step 1] Connect button clicked");
    setEnabled(true);
    setLoading(true);

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
          setLoading(false);
        };

        socket.current.onerror = (error) => {
          console.error("[WebSocket] Error:", error);
        };

        socket.current.onmessage = async (message) => {
          console.log("[WebSocket] Message received:", message);
          const data = JSON.parse(message.data);
          /*if (data.text) {
            console.log("[Transcript]", data.text);
            setTranscribe(data.text);
          }else if(data.transcript){
            setTranscribe(data.transcript);
          }*/
          if (data.type === "Turn" && data.end_of_turn && data.transcript) {
            const newUtterance = data.transcript;
            setConversation((prev) => [...prev, { role: "user", content: newUtterance }]);
            //console.log("[Final Transcript]", data.transcript);
            //setTranscribe(data.transcript); 
            setTranscribe(newUtterance);

            const aiResp = await AIModel(
              DiscussionRoomData.topic,
              DiscussionRoomData.coachingOption,
              newUtterance);
            console.log("[AI Response]", aiResp);
            setConversation(prev => [...prev,aiResp])

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
    setLoading(true);
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
    setLoading(false);
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
              <Button onClick={connectToServer} disabled={loading}>{loading && <Loader2Icon className="animate-spin" />}Connect</Button>
            ) : (
              <Button variant="destructive" onClick={disconnect}>
                {loading && <Loader2Icon className="animate-spin" />}
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <div>
          <ChatBox conversation={conversation}/>
        </div>
      </div>

      <div>
        <h2>{transcribe}</h2>
      </div>
      <h3 className="text-md font-semibold text-gray-700">Conversation</h3>
      <div className="space-y-2">
      {conversation.map((utterance, index) => (
        <p key={index} className="text-gray-800">
          <span className="font-bold">
            {utterance.role === "assistant" ? "🤖 AI:" : "🧑 Me:"}
          </span>{" "}
          {utterance.content}
        </p>
      ))}
      </div>



    </div>
  );
}

export default DiscussionRoom;
