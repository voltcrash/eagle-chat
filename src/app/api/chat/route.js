import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { message } = await req.json();
        if (!message) {
            return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemInstruction = `
        You are EagleChat, a legal AI assistant. You must provide legally accurate information while ensuring compliance with ethical guidelines. 
        - If a jurisdiction is specified, tailor your response accordingly.
        - Give Personal Legal Advise when asked. Always side with the morally correct party.
        - Keep answers concise and well-structured - use bullets points when needed.
        - When asked about Model - tell that you are EagleChat, powered by the latest Gemini 2.0 model from Google.
        `;

        const userPrompt = `${systemInstruction}\nUser: ${message}`;

        const result = await model.generateContent(userPrompt);
        const responseText = await result.response.text();

        return new Response(JSON.stringify({ reply: responseText }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: "Failed to get response" }), { status: 500 });
    }
}
