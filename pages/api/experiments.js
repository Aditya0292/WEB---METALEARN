import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
    const { method } = req;
    const { userId } = req.query; // For demo purposes, passed as query/body. In prod, use session.

    if (method === 'GET') {
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        try {
            // 1. Get Active Experiment
            const { data: active, error: activeError } = await supabase
                .from('experiments')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single(); // Assuming only one active at a time

            // 2. Return data
            return res.status(200).json({ activeExperiment: active || null });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    else if (method === 'POST') {
        const { userId, title, hypothesis, variable_a, variable_b } = req.body;

        // 1. Archive any existing active experiments (Enforce single active protocol)
        await supabase
            .from('experiments')
            .update({ status: 'archived' })
            .eq('user_id', userId)
            .eq('status', 'active');

        // 2. Create new one
        const { data, error } = await supabase
            .from('experiments')
            .insert({
                user_id: userId,
                title,
                hypothesis,
                variable_a,
                variable_b,
                status: 'active',
                scores_a: [],
                scores_b: []
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    else if (method === 'PUT') {
        // Log Data Point (Update scores)
        const { experimentId, variable, score } = req.body;

        // Fetch current to append
        const { data: current } = await supabase.from('experiments').select('*').eq('id', experimentId).single();
        if (!current) return res.status(404).json({ error: 'Not found' });

        let updates = {};
        if (variable === 'A') {
            const newScores = [...(current.scores_a || []), score];
            updates = { scores_a: newScores };
        } else {
            const newScores = [...(current.scores_b || []), score];
            updates = { scores_b: newScores };
        }

        const { data, error } = await supabase
            .from('experiments')
            .update(updates)
            .eq('id', experimentId)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        // Sync with User Profile: Increment session count and update rank
        try {
            const userId = current.user_id;
            const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
            if (profile) {
                const newTotal = (profile.total_sessions || 0) + 1;
                let rank = 'Bronze';
                if (newTotal > 50) rank = 'Diamond';
                else if (newTotal > 30) rank = 'Platinum';
                else if (newTotal > 15) rank = 'Gold';
                else if (newTotal > 5) rank = 'Silver';

                await supabase.from('user_profiles').update({
                    total_sessions: newTotal,
                    rank: rank,
                    last_updated: new Date()
                }).eq('user_id', userId);
            }
        } catch (e) {
            console.error("Failed to sync Lab session to profile:", e);
        }

        return res.status(200).json(data);
    }

    return res.status(405).end(`Method ${method} Not Allowed`);
}
