export function computeLearningSpeed(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    // Formula: Average of (confidence_score / time_spent_minutes)
    // Scaling: usually confidence is 1-5, time 5-180.
    // 5/5 = 1.0 (max), 1/180 = 0.005 (min).
    // We might want to normalize it or just return raw value. Prompt example: 0.150.

    const sumSpeed = sessions.reduce((acc, session) => {
        return acc + (session.confidence_score / session.time_spent_minutes);
    }, 0);

    return sumSpeed / sessions.length;
}

export function computeRetentionScore(sessions) {
    // Average confidence of sessions where revision_done = true
    const revisionSessions = sessions.filter(s => s.revision_done);
    if (revisionSessions.length === 0) return 0.5; // Default neutral

    const sumConf = revisionSessions.reduce((acc, s) => acc + s.confidence_score, 0);
    // Divided by 5 to normalize 0-1
    return (sumConf / revisionSessions.length) / 5;
}

export function computeConsistencyScore(sessions) {
    if (sessions.length < 2) return 1.0; // Perfect consistency if only 1 session (technically undefined but 1 is encouraging)

    // Sort by timestamp
    const sorted = [...sessions].sort((a, b) => new Date(a.session_timestamp) - new Date(b.session_timestamp));

    // Calculate days between
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
        const diffTime = Math.abs(new Date(sorted[i].session_timestamp) - new Date(sorted[i - 1].session_timestamp));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        intervals.push(diffDays);
    }

    if (intervals.length === 0) return 1.0;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Std Dev
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Formula: 1 - (stdDev / mean)
    // Clamp to 0-1
    const score = 1 - (stdDev / (mean || 1));
    return Math.max(0, Math.min(1, score));
}

export function computeErrorRecoveryRate(sessions) {
    // Average confidence of sessions where errors_made = true
    const errorSessions = sessions.filter(s => s.errors_made);
    if (errorSessions.length === 0) return 0.8; // Assume good if no errors reported

    const sumConf = errorSessions.reduce((acc, s) => acc + s.confidence_score, 0);
    return (sumConf / errorSessions.length) / 5;
}

export function computeOptimalDuration(sessions) {
    // Bucket into 15 min chunks
    const buckets = {};

    sessions.forEach(s => {
        const duration = s.time_spent_minutes;
        const bucketKey = Math.floor(duration / 15) * 15; // 0, 15, 30, 45...

        if (!buckets[bucketKey]) buckets[bucketKey] = { sumConf: 0, count: 0 };
        buckets[bucketKey].sumConf += s.confidence_score;
        buckets[bucketKey].count += 1;
    });

    let bestBucket = 30; // Default
    let maxAvg = -1;

    Object.keys(buckets).forEach(key => {
        const avg = buckets[key].sumConf / buckets[key].count;
        if (avg > maxAvg) {
            maxAvg = avg;
            bestBucket = parseInt(key);
        }
    });

    // Return the mid-point of the bucket (e.g. 30 -> 30-45 -> return 37)
    return bestBucket + 7;
}

export function computeAllFeatures(sessions) {
    return {
        learningLearningSpeed: computeLearningSpeed(sessions),
        retentionScore: computeRetentionScore(sessions),
        consistencyScore: computeConsistencyScore(sessions),
        errorRecoveryRate: computeErrorRecoveryRate(sessions),
        optimalDuration: computeOptimalDuration(sessions)
    };
}
