import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    try {
        // 1. Delete Sessions
        const { error: sessionError, count: sessionCount } = await supabase
            .from('sessions')
            .delete({ count: 'exact' })
            .eq('user_id', userId);

        if (sessionError) throw sessionError;

        // 2. Delete Coaching History
        const { error: coachingError, count: coachingCount } = await supabase
            .from('coaching_history')
            .delete({ count: 'exact' })
            .eq('user_id', userId);

        if (coachingError) throw coachingError;

        // 3. Reset Profile Metrics (but keep the user)
        const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
                learning_speed: 0.5,
                retention_score: 0.5,
                consistency_score: 0.5,
                error_recovery_rate: 0.5,
                total_sessions: 0,
                confidence_score: 0,
                rank: 'Bronze',
                dna_pattern: 'Undiscovered',
                dna_learning_mode: 'Undiscovered',
                last_updated: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (profileError) throw profileError;

        console.log(`Reset Data: Deleted ${sessionCount} sessions and ${coachingCount} coaching records for ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'Account data reset successfully',
            deleted: { sessions: sessionCount, coaching: coachingCount }
        });

    } catch (error) {
        console.error("Reset Error:", error);
        return res.status(500).json({ message: 'Failed to reset data', details: error.message });
    }
}
