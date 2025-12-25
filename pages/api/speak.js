import { generateVoiceAudio } from '@/lib/elevenLabsAPI';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const audioData = await generateVoiceAudio(text);
        if (audioData.startsWith('http')) {
            // It returned a fallback URL (song)
            return res.status(200).json({ url: audioData, isFallback: true });
        }
        // It returned base64 data uri
        return res.status(200).json({ url: audioData, isFallback: false });
    } catch (error) {
        console.error("Speak API Error:", error);
        return res.status(500).json({ error: 'Failed to generate audio' });
    }
}
