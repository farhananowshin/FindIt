const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const User = require("../models/User");
const ItemReport = require("../models/ItemReport");
const Claim = require("../models/Claim");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");

async function cleanAndOrganizeDatabase() {
  console.log("==================================================");
  console.log("🧹 FINDIT MONGODB ATLAS DATABASE OPTIMIZER & CLEANUP");
  console.log("==================================================\n");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env file!");
    process.exit(1);
  }

  console.log("📡 Connecting to MongoDB Atlas Cluster...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Connected successfully to: ${mongoose.connection.name}\n`);

  // 1. Try to Drop sample_mflix database
  console.log("🔹 [1/4] Checking and removing unused 'sample_mflix' database...");
  try {
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    const hasSampleMflix = dbs.databases.some((d) => d.name === "sample_mflix");

    if (hasSampleMflix) {
      console.log("   Found 'sample_mflix' database. Dropping to free up cluster storage...");
      const sampleDb = mongoose.connection.client.db("sample_mflix");
      await sampleDb.dropDatabase();
      console.log("   ✅ 'sample_mflix' dropped successfully! Storage freed.");
    } else {
      console.log("   ℹ️ 'sample_mflix' does not exist or was already removed.");
    }
  } catch (err) {
    console.warn(`   ⚠️ Notice: Could not drop 'sample_mflix' automatically (${err.message}). You can drop it directly in the Atlas UI if needed.`);
  }

  // 2. Clean dummy/e2e test items from itemreports
  console.log("\n🔹 [2/4] Cleaning dummy test items and orphan test users...");
  const deleteTestItemsResult = await ItemReport.deleteMany({
    $or: [
      { title: { $regex: /e2e pipeline test|automated tester|dummy/i } },
      { submitterEmail: "tester.e2e@campus.edu" },
      { reporterName: "Pipeline Automated Tester" },
    ],
  });
  console.log(`   ✅ Removed ${deleteTestItemsResult.deletedCount} automated test item report(s).`);

  const deleteTestUsersResult = await User.deleteMany({
    email: "tester.e2e@campus.edu",
  });
  console.log(`   ✅ Removed ${deleteTestUsersResult.deletedCount} temporary test user(s).`);

  // 3. Ensure Admin account is seeded and healthy
  console.log("\n🔹 [3/4] Ensuring Verified Admin Account exists...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@campus.edu";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecure2026!";
  const adminName = process.env.ADMIN_NAME || "Campus Security Admin";

  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      studentId: process.env.ADMIN_STUDENT_ID || "ADMIN-001",
      phone: process.env.ADMIN_PHONE || "+1 (555) 019-9000",
    });
    console.log(`   ✅ Admin user created: ${adminEmail}`);
  } else {
    // Ensure role is admin
    if (adminUser.role !== "admin") {
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`   ✅ Updated existing user ${adminEmail} to 'admin' role.`);
    } else {
      console.log(`   ✅ Admin user verified: ${adminEmail} (Role: admin)`);
    }
  }

  // 4. Detailed Collection Audit
  console.log("\n🔹 [4/4] Current Database Collections Audit:");
  console.log("------------------------------------------------------------------");
  const collections = [
    { name: "itemreports", model: ItemReport },
    { name: "users", model: User },
    { name: "claims", model: Claim },
    { name: "notifications", model: Notification },
  ];

  for (const col of collections) {
    const count = await col.model.countDocuments();
    console.log(`   📁 ${col.name.padEnd(16)} : ${count} documents`);
  }
  console.log("------------------------------------------------------------------");

  console.log("\n🎉 DATABASE IS CLEAN, OPTIMIZED, AND READY!");
  console.log("==================================================");

  await mongoose.disconnect();
}

cleanAndOrganizeDatabase().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
