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

        const { data: recentSessions } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .order('session_timestamp', { ascending: false });

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
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Sort all sessions by date for streak calculation
        const sortedAllSessions = [...(allSessions || [])].sort((a, b) =>
            new Date(b.session_timestamp) - new Date(a.session_timestamp)
        );

        if (allSessions && allSessions.length > 0) {
            totalSessions = allSessions.length;
            totalMinutes = allSessions.reduce((acc, curr) => acc + (curr.time_spent_minutes || 0), 0);
            totalConfidence = allSessions.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0);
            avgConfidence = (totalConfidence / totalSessions).toFixed(1);

            allSessions.forEach(s => {
                if (s.revision_done) revisionCount++;
                if (!s.errors_made) noErrorCount++;

                const sDate = new Date(s.session_timestamp);
                uniqueDaysSet.add(sDate.toDateString());
            });
        }

        // Calculate Streak Logic
        let streakDays = 0;
        if (uniqueDaysSet.size > 0) {
            let checkDate = new Date();
            // If the latest session isn't today or yesterday, streak is broken
            const latestSessionDate = new Date(sortedAllSessions[0].session_timestamp);
            const diffDays = Math.floor((now.getTime() - latestSessionDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                while (true) {
                    const dateStr = checkDate.toDateString();
                    if (uniqueDaysSet.has(dateStr)) {
                        streakDays++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        // Allow a 1-day gap (i.e., today doesn't have a session yet)
                        if (checkDate.toDateString() === now.toDateString()) {
                            checkDate.setDate(checkDate.getDate() - 1);
                            continue;
                        }
                        break;
                    }
                }
            }
        }

        // Calculate Real Metrics (Scale 0 to 1)
        // Speed: 0.1 (10%) per hour studied, max 1.0 (10 hours)
        const calcSpeed = Math.min((totalMinutes / 60) * 0.1, 1.0);

        // Consistency: Days studied in last 7 days / 7
        const last7DaysSet = new Set();
        allSessions?.forEach(s => {
            const sDate = new Date(s.session_timestamp);
            if (sDate >= sevenDaysAgo) last7DaysSet.add(sDate.toDateString());
        });
        const calcConsistency = Math.min(last7DaysSet.size / 7, 1.0);

        // Retention: % of sessions where revision was done (weighted towards recent)
        const calcRetention = totalSessions > 0 ? (revisionCount / totalSessions) : 0;

        // Recovery: % of sessions without errors (or recovered)
        const calcRecovery = totalSessions > 0 ? (noErrorCount / totalSessions) : 1.0;

        // Calculate Rank and DNA
        let rank = 'Bronze';
        if (totalSessions > 50) rank = 'Diamond';
        else if (totalSessions > 30) rank = 'Platinum';
        else if (totalSessions > 15) rank = 'Gold';
        else if (totalSessions > 5) rank = 'Silver';
        else rank = 'Bronze';

        let dnaPattern = 'Strategic';
        if (calcRetention < 0.4) dnaPattern = 'Developing';

        let dnaLearningMode = 'Mixed';
        if (calcRetention > 0.7 && calcRecovery > 0.7) dnaLearningMode = 'Visual';
        else if (calcSpeed > 0.7) dnaLearningMode = 'Audio';

        // UPDATE User Profile with Real Data (Persistent Cache)
        const profileUpdates = {
            user_id: userId,
            learning_speed: parseFloat(calcSpeed.toFixed(2)),
            consistency_score: parseFloat(calcConsistency.toFixed(2)),
            retention_score: parseFloat(calcRetention.toFixed(2)),
            error_recovery_rate: parseFloat(calcRecovery.toFixed(2)),
            total_sessions: totalSessions,
            rank: rank,
            dna_pattern: dnaPattern,
            dna_learning_mode: dnaLearningMode,
            last_updated: new Date().toISOString()
        };

        const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .upsert(profileUpdates)
            .select()
            .single();

        if (updateError) {
            // If DB update fails (e.g. RLS), merge calculations into existing profile for the response
            userProfile = { ...userProfile, ...profileUpdates };
        } else {
            userProfile = updatedProfile;
        }

        // Aggregate Data for Graph
        const { range = '30d' } = req.query;
        let startDate;

        if (range === '7d') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (range === '30d') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
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
            progressData = [{ date: 'Today', 'Overall': 0 }];
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
            streakDays
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
