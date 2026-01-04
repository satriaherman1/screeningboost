import { GoogleGenAI } from "@google/genai";

export async function analyzeCVWithGemini(cvText: string, jobDescription: string, apiKey: string) {
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
    You are an AI Recruitment Assistant. Analyze the following Candidate CV against the Job Description.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV Text:
    ${cvText}
    
    Output a strictly valid JSON object (no markdown formatting) with the following structure:
    {
        "score": number, // Overall suitability score 0-100
        "summary": "string", // Brief professional summary of the candidate's fit (max 2 sentences)
        "evaluation": [
            { "criteria": "Technical Skills", "score": number, "description": "reasoning" },
            { "criteria": "Experience", "score": number, "description": "reasoning" },
            { "criteria": "Education", "score": number, "description": "reasoning" }
        ],
        "fullName": "extracted full name or null if not found",
        "email": "extracted email or null if not found",
        "phone": "extracted phone number or null if not found",
        "skills": ["extracted", "skills", "array"]
    }
    `;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        
        const text = result.text;
        
        if (!text) {
            throw new Error("No response text from Gemini API");
        }
        
        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e: any) {
        console.error("Gemini SDK Analysis Failed:", e.message || e);
        if (e.response) {
            console.error("API Response Error:", JSON.stringify(e.response, null, 2));
        }
        throw new Error("Failed to analyze CV with AI: " + (e.message || "Unknown error"));
    }
}
