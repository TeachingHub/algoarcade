/**
 * Award Daily TSP Medals
 *
 * Evaluates yesterday's leaderboard and increments medal counters
 * on user documents:
 *   - 1st place → gold
 *   - 2nd place → silver
 *   - 3rd place → bronze
 *
 * Designed to run as a GitHub Actions cron job every day at 00:05 UTC,
 * awarding medals for the previous day's challenge.
 *
 * Usage:
 *   - Via GitHub Actions: automatically injects FIREBASE_SERVICE_ACCOUNT env var
 *   - Locally: FIREBASE_SERVICE_ACCOUNT='...' node award-daily-medals.js
 */

const admin = require("firebase-admin");

// ─── 1. Initialize Firebase Admin ──────────────────────────────

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("FIREBASE_SERVICE_ACCOUNT env var is not set.");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ─── 2. Helpers ─────────────────────────────────────────────────

/** Yesterday's date as YYYY-MM-DD in UTC */
function getYesterdayDateString() {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() - 1);
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

const MEDAL_KEYS = ["gold", "silver", "bronze"];

// ─── 3. Main ────────────────────────────────────────────────────

async function main() {
    const yesterday = getYesterdayDateString();
    console.log(`Awarding medals for: ${yesterday}`);

    // Check if medals were already awarded (idempotency)
    const metaRef = db.collection("tsp_daily_challenges").doc(`daily_${yesterday}`);
    const metaSnap = await metaRef.get();
    if (metaSnap.exists && metaSnap.data().medalsAwarded) {
        console.log(`Medals for ${yesterday} already awarded. Skipping.`);
        process.exit(0);
    }

    // Fetch the leaderboard for yesterday (top 3 by distance ascending)
    const scoresRef = db
        .collection("tsp_leaderboards")
        .doc(yesterday)
        .collection("scores");

    // Fetch more than 3 to handle ties at the boundary correctly
    const snapshot = await scoresRef.orderBy("distance", "asc").limit(10).get();

    if (snapshot.empty) {
        console.log(`No scores found for ${yesterday}. Nothing to award.`);
        // Mark as processed anyway to avoid re-checking
        await metaRef.set({ medalsAwarded: true }, { merge: true });
        process.exit(0);
    }

    const winners = [];
    snapshot.forEach((doc) => winners.push(doc.data()));

    // Client-side tiebreaker: same distance → earlier timestamp wins
    winners.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        const getMs = (t) => {
            if (!t) return Infinity;
            if (typeof t.toMillis === "function") return t.toMillis();
            if (t._seconds) return t._seconds * 1000;
            return Infinity;
        };
        return getMs(a.timestamp) - getMs(b.timestamp);
    });

    console.log(`Found ${winners.length} top scorers.`);

    // Award medals
    const batch = db.batch();

    for (let i = 0; i < Math.min(winners.length, 3); i++) {
        const userId = winners[i].userId;
        const medalKey = MEDAL_KEYS[i]; // gold, silver, bronze
        const userRef = db.collection("users").doc(userId);

        console.log(`  ${medalKey.toUpperCase()} → ${winners[i].displayName} (${userId}) — distance: ${winners[i].distance}`);

        batch.set(
            userRef,
            {
                tspMedals: {
                    [medalKey]: FieldValue.increment(1),
                },
            },
            { merge: true }
        );
    }

    // Mark challenge as processed
    batch.set(metaRef, { medalsAwarded: true }, { merge: true });

    await batch.commit();
    console.log("Medals awarded successfully!");
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
