/**
 * Cleanup Old Shared TSP Instances
 *
 * Deletes shared TSP instances (from the "tsp_instances" collection)
 * that are older than 7 days, to prevent database bloat.
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

const COLLECTION_NAME = "tsp_instances";
const MAX_AGE_DAYS = 7;
const BATCH_SIZE = 100;

// ─── 3. Main ────────────────────────────────────────────────────

async function main() {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - MAX_AGE_DAYS);

    console.log(`Deleting shared instances older than ${cutoff.toISOString()}...`);

    const query = db
        .collection(COLLECTION_NAME)
        .where("createdAt", "<", cutoff)
        .limit(BATCH_SIZE);

    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
        const snapshot = await query.get();

        if (snapshot.empty) {
            hasMore = false;
            break;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        totalDeleted += snapshot.size;
        console.log(`  Deleted batch of ${snapshot.size} (total: ${totalDeleted})`);

        // If we got fewer than BATCH_SIZE, we're done
        if (snapshot.size < BATCH_SIZE) {
            hasMore = false;
        }
    }

    console.log(`Done. Deleted ${totalDeleted} old shared instance(s).`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
