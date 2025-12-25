import { chatWithMentor } from '@/lib/geminiAPI';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const reply = await chatWithMentor(message, history || []);
        return res.status(200).json({ success: true, reply });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
