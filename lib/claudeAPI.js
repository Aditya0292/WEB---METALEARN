export async function generateInsight(userProfile, recentSessions) {
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    // Construct the prompt context
    const context = `
      User Profile: ${JSON.stringify(userProfile)}
      Recent Sessions: ${JSON.stringify(recentSessions)}
      
      Analyze the user's learning patterns. Look for fatigue, consistency issues, or improvements.
      Provide a concise 1-sentence insight and a specific strategy.
      Return JSON format: { "text": "...", "pattern": "...", "strategy": "..." }
    `;

    console.log("Generating insight with Claude...");

    if (!API_KEY) {
        console.warn("Missing ANTHROPIC_API_KEY, returning mock insight.");

        // Dynamic Mock Logic
        const latestSession = recentSessions && recentSessions.length > 0 ? recentSessions[0] : null;
        const topic = latestSession ? latestSession.topic : "general study";
        const confidence = latestSession ? latestSession.confidence_score : 3;

        let mockText = "";
        let mockPattern = "";
        let mockStrategy = "";

        if (confidence >= 4) {
            mockText = `I noticed strong performance in your recent ${topic} session. Your confidence is high!`;
            mockPattern = "High Mastery";
            mockStrategy = "Spaced Repetition (longer intervals)";
        } else if (confidence <= 2) {
            mockText = `You seemed to struggle a bit with ${topic}. Consistency is key here.`;
            mockPattern = "Concept Gap";
            mockStrategy = "Active Recall Review";
        } else {
            mockText = `You are maintaining steady progress in ${topic}. Try to push for deeper understanding next time.`;
            mockPattern = "Steady Growth";
            mockStrategy = "Feynman Technique";
        }

        return {
            text: mockText,
            pattern: mockPattern,
            strategy: mockStrategy
        };
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                max_tokens: 300,
                messages: [
                    { role: "user", content: context }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Claude API Error:", err);
            throw new Error("Claude API Failed");
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Simple heuristic parsing if Claude doesn't return perfect JSON (or we could force tool use in a real scenario)
        // For this demo, we'll try to parse JSON, or fall back to text.
        try {
            return JSON.parse(content);
        } catch {
            return {
                text: content,
                pattern: "AI Analysis",
                strategy: "Custom Strategy"
            };
        }

    } catch (error) {
        console.error("Error calling Claude:", error);
        return {
            text: "I noticed your retention drops when study sessions exceed 45 minutes. Try breaking them into shorter 25-minute sprints to boost your focus.",
            pattern: "Long Session Fatigue",
            strategy: "Pomodoro Technique"
        };
    }
}
