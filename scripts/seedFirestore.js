// seedFirestore.js - Node.js script for one time seeding
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { readFileSync } = require("fs");
const { resolve } = require("path");

// Load service account key
const serviceAccount = require("../services/serviceAccountKey.json");

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const seedFirestore = async () => {
  try {
    console.log("🌱 Starting Firestore seeding...");

    // Load spots data
    const spotsPath = resolve(__dirname, "../data/spots.json");
    const spotsData = JSON.parse(readFileSync(spotsPath, "utf8"));
    console.log(`📊 Loaded ${spotsData.length} spots from JSON`);

    // Check existing data
    const spotsRef = db.collection("spots");

    // Batch write to db by appending
    console.log("📝 Appending new spots...");
    const batch = db.batch();

    spotsData.forEach((spot) => {
      const docRef = spotsRef.doc();
      batch.set(docRef, {
        ...spot,
        createdAt: new Date(),
        createdBy: "seed_script",
        updatedAt: new Date(),
        id: docRef.id,
      });
      console.log(`  📍 Queued: ${spot.name}`);
    });

    await batch.commit();
    console.log(`🎉 Successfully seeded ${spotsData.length} spots!`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

// Run it
if (require.main === module) {
  seedFirestore().then(() => {
    console.log("👋 Script complete");
    process.exit(0);
  });
}
