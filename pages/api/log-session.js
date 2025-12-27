import { supabase } from '@/lib/supabaseClient';
import { computeAllFeatures } from '@/lib/featureEngineering';
import { generateInsight } from '@/lib/geminiAPI';
import { generateVoiceAudio } from '@/lib/elevenLabsAPI';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, topic, timeSpent, confidenceScore, errorsMade, revisionDone } = req.body;

    if (!topic || !timeSpent) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Insert session
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .insert([
                {
                    user_id: userId,
                    topic,
                    time_spent_minutes: timeSpent,
                    confidence_score: confidenceScore,
                    errors_made: errorsMade,
                    revision_done: revisionDone
                }
            ])
            .select()
            .single();

        if (sessionError) {
            console.error("Supabase Error:", sessionError);
            // If DB connection fails, we just return mock success for the demo
            return res.status(200).json({ success: true, mock: true, message: "Session logged (Mock Mode)" });
        }

        // 2. Fetch all sessions for analysis
        const { data: allSessions } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .limit(50);

        // 3. Compute Features
        const metrics = computeAllFeatures(allSessions || []);

        // 4. Update Profile
        // Calculate average confidence directly to be safe
        const totalConfidence = (allSessions || []).reduce((sum, s) => sum + (Number(s.confidence_score) || 0), 0);
        const avgConfidence = (allSessions?.length > 0) ? (totalConfidence / allSessions.length) : 0;
        const sessionCount = allSessions?.length || 0;

        // Rank Logic
        let rank = 'Bronze';
        if (sessionCount > 50) rank = 'Diamond';
        else if (sessionCount > 30) rank = 'Platinum';
        else if (sessionCount > 15) rank = 'Gold';
        else if (sessionCount > 5) rank = 'Silver';

        // Simple DNA mapping logic for demo
        const dnaPattern = sessionCount > 10 ? "Strategic" : "Developing";
        const dnaMode = metrics.retentionScore > 0.7 ? "Visual/Deep" : "Exploratory";

        await supabase.from('user_profiles').upsert({
            user_id: userId,
            learning_speed: metrics.learningLearningSpeed ?? 0.5,
            retention_score: metrics.retentionScore ?? 0.5,
            consistency_score: metrics.consistencyScore ?? 0.5,
            error_recovery_rate: metrics.errorRecoveryRate ?? 0.5,
            optimal_session_duration: metrics.optimalDuration || 45,
            total_sessions: sessionCount,
            confidence_score: avgConfidence,
            rank: rank,
            dna_pattern: dnaPattern,
            dna_learning_mode: dnaMode,
            last_updated: new Date()
        });

        // 5. Check if coaching needed
        // For Demo: Generate coaching on EVERY session to show features immediately
        const shouldGenerateCoaching = true;

        if (shouldGenerateCoaching) {
            console.log("Generating coaching insight...");

            // Generate Insight (Mock or Real)
            const insight = await generateInsight(null, allSessions || []);

            // Generate Audio (Mock or Real)
            const audioUrl = await generateVoiceAudio(insight.text);

            // Save to DB
            const { error: coachingError } = await supabase
                .from('coaching_history')
                .insert([{
                    user_id: userId,
                    insight_text: insight.text,
                    pattern_detected: insight.pattern || "AI Analysis",
                    strategy_recommended: insight.strategy,
                    audio_url: audioUrl
                }]);

            if (coachingError) console.error("Coaching Save Error:", coachingError);
        }

        return res.status(200).json({
            success: true,
            sessionId: sessionData.id,
            newMetrics: metrics,
            shouldGenerateCoaching
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
