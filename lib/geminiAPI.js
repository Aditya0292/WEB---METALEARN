const API_KEY = process.env.OPENROUTER_API_KEY || ""; // OpenRouter API Key from environment

const MODELS = [
    "meta-llama/llama-3.2-3b-instruct:free", // Primary
    "mistralai/mistral-7b-instruct:free",    // Backup
    "google/gemini-2.0-flash-exp:free"       // Last Resort
];

export async function generateInsight(userProfile, recentSessions, filters = {}) {
    const { subject = 'All', mode = 'combined' } = filters;

    // Use a backup mock if we absolutely crash, but we should try hard first.
    const mockFallback = (error) => {
        console.warn("API Failed, using rule-based fallback:", error);
        return {
            insight: "I'm having trouble analyzing your live data right now. However, consistency is your best asset. Keep logging sessions!",
            what_to_study: "Review your recent notes.",
            how_to_study: "Try 25-minute focus blocks (Pomodoro).",
            confidence_tip: "Every session counts.",
            revision_plan: "Review tomorrow.",
            youtube_queries: ["Study tips", "Focus music"]
        };
    };

    try {
        let specializedInstruction = "";

        if (subject && subject !== 'All') {
            specializedInstruction += `CONTEXT: Filtered dataset: "${subject}". Ignore other subjects. `;
        }

        if (mode === 'performance') {
            specializedInstruction += `STRICT MODE: PERFORMANCE AUDITOR. Start insight with "📊 ANALYSIS:". Be data-driven.`;
        } else if (mode === 'advice') {
            specializedInstruction += `STRICT MODE: STRATEGIC COACH. Start insight with "💡 STRATEGY:". Be actionable.`;
        }

        const prompt = `
          You are a world-class cognitive performance coach.
          ${specializedInstruction}

          Analyze this recent session:
          Topic: ${recentSessions[0]?.topic || 'General'}
          Confidence: ${recentSessions[0]?.confidence_score || 3}/5
          Duration: ${recentSessions[0]?.time_spent_minutes || 0} mins
          
          Provide a JSON report (NO MARKDOWN):
          {
            "insight": "3-4 sentence sophisticated analysis/advice.",
            "what_to_study": "Next focus area.",
            "how_to_study": "Specific technique (e.g. Active Recall).",
            "confidence_tip": "Short motivational tip.",
            "revision_plan": "Next review timing.",
            "youtube_queries": ["Query 1", "Query 2"]
          }
        `;

        // Robust Fetch Loop
        for (const model of MODELS) {
            console.log(`[Web AI] Trying Model: ${model}...`);
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://metalearn.ai',
                        'X-Title': 'MetaLearn Web'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: "You are a senior academic performance coach. Output JSON only." },
                            { role: "user", content: prompt }
                        ],
                        response_format: { type: "json_object" }
                    })
                });

                if (response.status === 429) {
                    console.warn(`Model ${model} busy (429).`);
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                }

                const data = await response.json();
                const content = data.choices[0].message.content;
                const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();

                return JSON.parse(jsonString);

            } catch (e) {
                console.warn(`Model ${model} error:`, e.message);
            }
        }

        throw new Error("All models exhausted.");

    } catch (error) {
        return mockFallback(error.message);
    }
}

export async function chatWithMentor(message, history = []) {
    if (!API_KEY) return "Configuration Error: No API Key.";

    try {
        const messages = [
            { role: "system", content: "You are a supportive, wise 'Big Brother' mentor. Be concise and encouraging." },
            ...history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content })),
            { role: "user", content: message }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://metalearn.ai',
                'X-Title': 'MetaLearn Web'
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.2-3b-instruct:free", // Use fast model for chat
                messages: messages
            })
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Chat Error:", error);
        return "I'm disconnected from the neural net right now. Try again in a moment.";
    }
}
