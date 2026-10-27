/**
 * Award Daily Medals
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

const MEDAL_KEYS = ["gold", "silver", "bronze"];

const GAMES = [
    {
        id: "tsp",
        leaderboardsCollection: "tsp_leaderboards",
        dailyChallengesCollection: "tsp_daily_challenges",
        scoreOrder: "asc"
    },
    {
        id: "knapsack",
        leaderboardsCollection: "knapsack_leaderboards",
        dailyChallengesCollection: "knspasack_daily_challenges",
        scoreOrder: "desc"
    },
];

// ─── 2. Helpers ─────────────────────────────────────────────────

/** Yesterday's date as YYYY-MM-DD in UTC */
function getYesterdayDateString() {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() - 1);
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function getTimestampMilliseconds(timestamp) {
    if (!timestamp) return Infinity;
    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (timestamp._seconds) return timestamp._seconds * 1000;
    return Infinity;
};

function compareScores(a, b, scoreOrder) {
    if (a.score !== b.score) {
        return scoreOrder === "asc" ? a.score - b.score : b.score -a.score;
    }
    if (a.time_ms !== b.time_ms) {
        return a.time_ms - b.time_ms;
    }
    return (getTimestampMilliseconds(a.timestamp) - getTimestampMilliseconds(b.timestamp));
}

// ─── 3. Award Medals ────────────────────────────────────────────────────

async function awardMedalsForGame(game, yesterday) {
    const { id: gameId, leaderboardsCollection, dailyChallengesCollection, scoreOrder } = game;

    const metaRef = db.collection(dailyChallengesCollection).doc(`daily_${yesterday}`);
    const metaSnap = await metaRef.get();

    if (metaSnap.exists && metaSnap.data().medalsAwarded) {
        console.log(`Medals for ${gameId} on ${yesterday} already awarded. Skipping.`);
        return;
    }

    const scoresRef = db
        .collection(leaderboardsCollection)
        .doc(yesterday)
        .collection("scores");

    const snapshot = await scoresRef.orderBy("score", scoreOrder).limit(10).get();

    if (snapshot.empty) {
        console.log(`No scores founf for ${gameId} on ${yesterday}.`);

        await metaRef.set({ medalsAwarded: true }, { merge: true });
        return;
    }

    const winners = []

    snapshot.forEach((doc) => {
        const data = doc.data();

        if (typeof data.score !== "number") {
            console.warn(`Ignoring ${gameId} score ${doc.id}: score is not a number.`);
            return;
        }

        winners.push({...data, documentId: doc.id});
    });

    winners.sort((a, b) => compareScores(a, b, scoreOrder));

    console.log(`Found ${winners.length} valid scores for ${gameId}.`);

    const batch = db.batch();

    for (let i = 0; i < Math.min(winners.length, 3); i++) {
        const winner = winners[i];
        const medalKey = MEDAL_KEYS[i];

        if (!winner.userId) {
            console.warn(`Ignoring winner ${winner.documentId}: missing userId.`);
            continue;
        }
        
        const userRef = db.collection("users").doc(winner.userId);

        console.log(`  ${medalKey.toUpperCase()} → ${winner.displayName || winner.userId} (${winner.userId}) — score: ${winner.score}`);

        const medalsField = `${gameId}Medals`;

        batch.set(
            userRef,
            {
                [medalsField]: {
                    [medalKey]: FieldValue.increment(1),
                },
            },
            { merge: true }
        );
    }

    batch.set(metaRef, { medalsAwarded: true }, { merge: true });

    await batch.commit();

    console.log(`Medals for ${gameId} awarded successfully!`);
}
        

// ─── 4. Main ────────────────────────────────────────────────────

async function main() {
    const yesterday = getYesterdayDateString();

    console.log(`Awarding medals for all games on: ${yesterday}`);

    for (const game of GAMES) {
        try {
            await awardMedalsForGame(game, yesterday);
        } catch (error) {
            console.error(`Error processing game ${game.id}:`, error)
        }
    }

    console.log("\nFinished processing all games");
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
