/**
 * Cleanup Old Shared Instances
 *
 * Deletes shared instances that are older than 7 days, to prevent database bloat.
 *
 * Designed to run as a GitHub Actions cron job once daily.
 *
 * Usage:
 *   - Via GitHub Actions: automatically injects FIREBASE_SERVICE_ACCOUNT env var
 *   - Locally: FIREBASE_SERVICE_ACCOUNT='...' node cleanup-shared-instances.js
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

// ─── 2. Config ──────────────────────────────────────────────────

const GAMES = [
    "tsp",
    "knapsack"
];
const MAX_AGE_DAYS = 7;
const BATCH_SIZE = 100;

// ─── 3. Delete instances ────────────────────────────────────────────────────

async function deleteOldInstancesForGame(gameId, cutoff) {
    const collectionName = `${gameId}_instances`;

    console.log(`Deleting shared instances from ${collectionName} older than ${cutoff.toISOString()}...`);

    let totalDeleted = 0;

    while (true) {
        const snapshot = await db
            .collection(collectionName)
            .where("createdAt", "<", cutoff)
            .limit(BATCH_SIZE)
            .get();
        
        if (snapshot.empty) break;

        const batch = db.batch();

        snapshot.docs.forEach((doc => {
            batch.delete(doc.ref);
        }));

        await batch.commit();

        totalDeleted += snapshot.size;

        console.log(`  [${gameId}] Deleted batch of ${snapshot.size} (total: ${totalDeleted})`);

        if (snapshot.size < BATCH_SIZE) {
            break;
        }
    }

    console.log(`Done with ${collectionName}. Deleted ${totalDeleted} old shared instance(s).`);

    return totalDeleted;
}

// ─── 4. Main ────────────────────────────────────────────────────

async function main() {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - MAX_AGE_DAYS);

    console.log(`Deleting shared instances older than ${cutoff.toISOString()}...`);

    let totalDeleted = 0;

    for (const gameId of GAMES) {
        try {
            totalDeleted += await deleteOldInstancesForGame(gameId, cutoff);
        } catch (error) {
            console.error(`Error deleting old instances for game ${gameId}:`, error);
        }
    }

    console.log(`Done. Deleted ${totalDeleted} old shared instances(s) in total.`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
