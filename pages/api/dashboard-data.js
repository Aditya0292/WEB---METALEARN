import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    try {
        // 1. Get or Create User Profile (Sync for Demo)
        let { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (profileError || !userProfile) {
            console.log("User not found, creating demo profile...");
            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    learning_speed: 0.5,
                    retention_score: 0.5,
                    consistency_score: 0.5,
                    error_recovery_rate: 0.5,
                    total_sessions: 0
                })
                .select()
                .single();

            if (createError) throw createError;
            userProfile = newProfile;
        }

        const { data: recentSessions } = await supabase.from('sessions').select('*').eq('user_id', userId).order('session_timestamp', { ascending: false }).limit(10);
        const { data: latestCoaching } = await supabase.from('coaching_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();

        // 4. Fetch ALL sessions for accurate stats (Total Hours, Total Sessions, Avg Confidence)
        // 4. Fetch ALL sessions for accurate stats
        const { data: allSessions } = await supabase
            .from('sessions')
            .select('time_spent_minutes, confidence_score, session_timestamp, topic, revision_done, errors_made') // Added fields
            .eq('user_id', userId);

        let totalSessions = 0;
        let totalMinutes = 0;
        let totalConfidence = 0;
        let avgConfidence = 0;

        // Metrics Calculation Variables
        let revisionCount = 0;
        let noErrorCount = 0;
        let uniqueDaysSet = new Set();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (allSessions && allSessions.length > 0) {
            totalSessions = allSessions.length;
            totalMinutes = allSessions.reduce((acc, curr) => acc + (curr.time_spent_minutes || 0), 0);
            totalConfidence = allSessions.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0);
            avgConfidence = (totalConfidence / totalSessions).toFixed(1);

            allSessions.forEach(s => {
                if (s.revision_done) revisionCount++;
                if (!s.errors_made) noErrorCount++;

                const sDate = new Date(s.session_timestamp);
                if (sDate >= sevenDaysAgo) {
                    uniqueDaysSet.add(sDate.toDateString());
                }
            });
        }

        // Calculate Real Metrics
        // Speed: 5% per hour studied (max 100%)
        const calcSpeed = Math.min((totalMinutes / 60) * 0.05, 1.0);

        // Consistency: Days studied in last 7 days / 7
        const calcConsistency = Math.min(uniqueDaysSet.size / 7, 1.0);

        // Retention: % of sessions where revision was done (proxy)
        const calcRetention = totalSessions > 0 ? (revisionCount / totalSessions) : 0;

        // Recovery: % of sessions without errors (or recovered)
        const calcRecovery = totalSessions > 0 ? (noErrorCount / totalSessions) : 1.0;

        // UPDATE User Profile with Real Data
        const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: userId,
                learning_speed: parseFloat(calcSpeed.toFixed(2)),
                consistency_score: parseFloat(calcConsistency.toFixed(2)),
                retention_score: parseFloat(calcRetention.toFixed(2)),
                error_recovery_rate: parseFloat(calcRecovery.toFixed(2)),
                total_sessions: totalSessions,
                last_updated: new Date().toISOString()
            })
            .select()
            .single();

        if (!updateError) {
            userProfile = updatedProfile; // Use the fresh data
        }

        // Aggregate Data for Graph
        const { range = '30d' } = req.query;
        let startDate;

        if (range === '7d') {
            startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } else if (range === '30d') {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        } else {
            startDate = new Date(0);
        }

        const graphSessions = allSessions?.filter(s => new Date(s.session_timestamp) >= startDate) || [];

        const progressMap = new Map();

        graphSessions.sort((a, b) => new Date(a.session_timestamp) - new Date(b.session_timestamp)).forEach(session => {
            const date = new Date(session.session_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!progressMap.has(date)) {
                progressMap.set(date, { date, _count: 0, _totalConf: 0 });
            }
            const entry = progressMap.get(date);

            // Add individual topic data
            entry[session.topic] = session.confidence_score;

            // Accumulate for daily average
            entry._count += 1;
            entry._totalConf += (session.confidence_score || 0);

            // Calculate running average for the day
            entry['Overall'] = parseFloat((entry._totalConf / entry._count).toFixed(1));
        });

        // Convert Map to Array
        let progressData = Array.from(progressMap.values());

        // If empty, provide ONE generic point so graph doesn't break
        if (progressData.length === 0) {
            progressData = [{ date: 'Today', 'No Data': 0 }];
        }

        return res.status(200).json({
            userProfile,
            recentSessions,
            latestCoaching,
            progressData,
            stats: {
                totalSessions,
                totalHours: (totalMinutes / 60).toFixed(1),
                avgConfidence
            },
            streakDays: 5
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return res.status(500).json({
            message: 'Error fetching dashboard data',
            details: error.message,
            hint: error.hint || error.details || 'Check server logs'
        });
    }
}
