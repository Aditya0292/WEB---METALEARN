export async function generateVoiceAudio(text) {
    const API_KEY = process.env.ELEVENLABS_API_KEY; // Managed via environment variables
    const VOICE_ID = 'K8BfdqcaGBJD6w7ZKMcO'; // User-provided Voice ID

    console.log("Synthesizing voice for:", text);

    if (!API_KEY) {
        console.warn("Missing ELEVENLABS_API_KEY, returning mock audio.");
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("ElevenLabs API Error:", errorData);
            return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Fallback
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        return `data:audio/mpeg;base64,${base64Audio}`;

    } catch (error) {
        console.error("Error generating voice:", error);
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Fallback
    }
}
