import { supabase } from '@/lib/supabaseClient';
import { generateInsight } from '@/lib/geminiAPI';
import { generateVoiceAudio } from '@/lib/elevenLabsAPI';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, filters } = req.body;

    try {
        // 1. Fetch Profile
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();

        // 2. Fetch Recent Sessions (with Strict Filtering)
        let query = supabase.from('sessions').select('*').eq('user_id', userId);

        if (filters?.subject && filters.subject !== 'All') {
            query = query.eq('topic', filters.subject);
        }

        const { data: sessions } = await query.order('session_timestamp', { ascending: false }).limit(5);

        // 3. Detect Patterns & 4. Generate Insight (Claude)
        const insightData = await generateInsight(profile, sessions, filters);

        // 5. Convert to Voice (ElevenLabs) - Fail gracefully
        let audioUrl = null;
        try {
            audioUrl = await generateVoiceAudio(insightData.insight);
        } catch (voiceError) {
            console.error("Voice generation failed (continuing...):", voiceError.message);
        }

        // 6. Save to History
        const { data: savedRecord, error } = await supabase.from('coaching_history').insert([{
            user_id: userId,
            insight_text: insightData.insight,
            audio_url: audioUrl,
            strategy_recommended: insightData.how_to_study,
            pattern_detected: filters?.mode === 'performance' ? "Performance Audit" : "Strategic Advice"
        }]).select().single();

        if (error) {
            // Even if DB fails, return the generated insight
            console.error("DB Save failed:", error.message);
        }

        return res.status(200).json({
            success: true,
            insight: insightData.insight,
            whatToStudy: insightData.what_to_study,
            howToStudy: insightData.how_to_study,
            confidenceTip: insightData.confidence_tip,
            revisionPlan: insightData.revision_plan,
            youtubeQueries: insightData.youtube_queries || [],
            audioUrl: audioUrl
        });

        return res.status(200).json({
            success: true,
            insightText: savedRecord.insight_text, // Kept for legacy compatibility
            insight: insightData.insight,
            whatToStudy: insightData.what_to_study,
            howToStudy: insightData.how_to_study,
            confidenceTip: insightData.confidence_tip,
            revisionPlan: insightData.revision_plan,
            audioUrl: savedRecord.audio_url
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error generating coaching' });
    }
}
