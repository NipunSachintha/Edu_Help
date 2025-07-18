import axios from "axios";
import OpenAI from "openai";
import { ExpertsList } from "./Options";


export const getToken = async() => {
        const result = await axios.get('/api/getToken');
        return result.data;
}

const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
});

export const AIModel = async(topic, ExpertsLists,msg) => {
        //const option = ExpertsList.find(item => item.name === topic);
        const option = ExpertsList.find(item => item.name === ExpertsLists);
        const PROMPT = (option.prompt).replace('{user_topic}', topic);

        const completion = await openai.chat.completions.create({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                        {role: "assistant", content: PROMPT},
                        {role: "user", content: msg}
                ],
        });

        console.log(completion.choices[0].message);
        return completion.choices[0].message;
}


