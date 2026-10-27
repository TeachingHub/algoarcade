/**
 * Generate Daily Challenge
 * 
 * This script generates a random instance for all the daily challenges
 * and save them to Firestore. It's designed to run as a GitHub Actions cron job
 * every day at 00:00 UTC.
 * 
 * Usage:
 *   - Via GitHub Actions: automatically injects FIREBASE_SERVICE_ACCOUNT env var
 */

const admin = require("firebase-admin");
const { dailyChallengeGenerators } = require("./daily-challenges");


if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("FIREBASE_SERVICE_ACCOUNT env var is not set.");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();


function getTodayUtc() {
    const now = new Date();

    return [
        now.getUTCFullYear(),
        String(now.getUTCMonth() + 1).padStart(2, "0"),
        String(now.getUTCDate()).padStart(2, "0"),
    ].join("-");
}

async function generateDailyChallenge(generator, dateString) {
    const { game, collection, generate } = generator;

    const documentId = `daily_${dateString}`
    const documentReference = db.collection(collection).doc(documentId);

    const existingDocument = await documentReference.get();

    if (existingDocument.exists) {
        console.log(`[${game}] Challenge for ${dateString} already exists. Skipping.`);

        return;
    }

    const challenge = generate({ author: "system"});

    await documentReference.set({
        data: challenge.data,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[${game}] Daily challenge created: ${documentId}`);

    return;
}


async function main() {
    const today = getTodayUtc();

    console.log(`Generating daily challenge for: ${today}`);

    for (const generator of dailyChallengeGenerators) {
        await generateDailyChallenge(generator, today);
    }
}

main().catch((error) => {
    console.error("Failed to generate daily challenges:", error);
    process.exit(1);
});
