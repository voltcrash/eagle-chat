import {GoogleGenerativeAI} from "@google/generative-ai";

export async function POST(req) {
    try {
        const {message} = await req.json();
        if (!message) {
            return new Response(JSON.stringify({error: "Message is required"}), {status: 400});
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});

        const systemInstruction = `
            You are EagleChat, a legal AI assistant. You must provide legally accurate information while ensuring compliance with ethical guidelines. 
            - If a jurisdiction is specified, tailor your response accordingly.
            - Give Personal Legal Advice when asked. Always side with the morally correct party.
            - Keep answers concise and well-structured. Use **bold** and *italic* formatting when needed.
            - In situations that require larger answers, use paragraphs separated by empty lines.
            - Do not repeatedly state limitations like "As an AI, I cannot do this or that." Provide a solution or alternative where possible.
            - If asked what model you are using, only then answer that you powered by Gemini 2.0 from Google
            `;

        const userPrompt = `${systemInstruction}\nUser: ${message}`;

        const result = await model.generateContent(userPrompt);
        const responseText = await result.response.text();

        return new Response(JSON.stringify({reply: responseText}), {status: 200});
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({error: "Failed to get response"}), {status: 500});
    }
}
