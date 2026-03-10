/**
 * Generate Daily TSP Challenge
 * 
 * This script generates a random set of points for the daily TSP challenge
 * and saves it to Firestore. It's designed to run as a GitHub Actions cron job
 * every day at 00:00 UTC.
 * 
 * Usage:
 *   - Via GitHub Actions: automatically injects FIREBASE_SERVICE_ACCOUNT env var
 *   - Locally: node generate-daily-challenge.js (uses ../backend/config/serviceAccountKey.json)
 */

const admin = require("firebase-admin");

// ─── 1. Initialize Firebase Admin ──────────────────────────────

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("FIREBASE_SERVICE_ACCOUNT env var is not set.");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── 2. Generate random points ─────────────────────────────────

const DAILY_POINT_COUNT = 15;
const MARGIN = 0.05; // 5% margin from edges (normalized 0-1 coordinates)

function generateNormalizedRandomPoints(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push({
            id: i,
            // Normalized coordinates between MARGIN and (1 - MARGIN)
            x: MARGIN + Math.random() * (1 - 2 * MARGIN),
            y: MARGIN + Math.random() * (1 - 2 * MARGIN),
        });
    }
    return points;
}

// ─── 3. Encode in the same format as the frontend TSPService ────

function encodeTSPInstance(author, points) {
    const pointsArray = points.map((p) => [p.id, p.x, p.y]);
    return JSON.stringify([author, pointsArray]);
}

// ─── 4. Main ────────────────────────────────────────────────────

async function main() {
    // Get today's date in UTC as YYYY-MM-DD
    const now = new Date();
    const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
    const docId = `daily_${today}`;

    console.log(`Generating daily challenge for: ${today}`);

    // Check if today's challenge already exists
    const existingDoc = await db.collection("tsp_daily_challenges").doc(docId).get();
    if (existingDoc.exists) {
        console.log(`Challenge for ${today} already exists. Skipping.`);
        process.exit(0);
    }

    // Generate new challenge
    const points = generateNormalizedRandomPoints(DAILY_POINT_COUNT);
    const encoded = encodeTSPInstance("system", points);

    // Save to Firestore
    await db.collection("tsp_daily_challenges").doc(docId).set({
        data: encoded,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Daily challenge created: ${docId}`);
    console.log(`Points: ${DAILY_POINT_COUNT}`);
    console.log(`Format: normalized (0-1 coordinates)`);

    process.exit(0);
}

main().catch((error) => {
    console.error("Failed to generate daily challenge:", error);
    process.exit(1);
});
