import axios from "axios";
import OpenAI from "openai";
import { ExpertsList } from "./Options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";


export const getToken = async () => {
        const result = await axios.get('/api/getToken');
        return result.data;
}

const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
});

export const AIModel = async (topic, ExpertsLists, msg) => {
        //const option = ExpertsList.find(item => item.name === topic);
        const option = ExpertsList.find(item => item.name === ExpertsLists);
        const PROMPT = (option.prompt).replace('{user_topic}', topic);

        const completion = await openai.chat.completions.create({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                        { role: "assistant", content: PROMPT },
                        { role: "user", content: msg }
                ],
        });

        console.log(completion.choices[0].message);
        return completion.choices[0].message;
}

export const AIModelToGenerateFeedbackAndNotes = async (ExpertsLists, conversation) => {
        //const option = ExpertsList.find(item => item.name === topic);
        const option = ExpertsList.find(item => item.name === ExpertsLists);
        const PROMPT = (option.summeryPrompt)

        const completion = await openai.chat.completions.create({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                        ...conversation,
                        { role: "assistant", content: PROMPT },
                ],
        });

        console.log(completion.choices[0].message);
        return completion.choices[0].message;
}

export const ConvertTextToSpeech = async (text, expertName) => {
        const pollyClient = new PollyClient({
                region: "us-east-1",
                credentials: {
                        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY
                }
        });
        const command = new SynthesizeSpeechCommand({
                Text: text,
                OutputFormat: "mp3",
                VoiceId: expertName
        })
        try {
                const { AudioStream } = await pollyClient.send(command);

                const audioArrayBuffer = await AudioStream.transformToByteArray();
                const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });

                const audioUrl = URL.createObjectURL(audioBlob);
                return audioUrl;

        } catch (e) {
                console.log(e);
        }


}


