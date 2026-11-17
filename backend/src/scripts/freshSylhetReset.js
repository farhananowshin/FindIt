const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const ItemReport = require("../models/ItemReport");
const User = require("../models/User");
const Claim = require("../models/Claim");
const Notification = require("../models/Notification");

function generateNormalizedVector(dim, seed) {
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(seed * (i + 1)) * Math.cos((seed + 1) * (i + 2));
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

async function runFreshSylhetReset() {
  console.log("================================================================");
  console.log("✨ FINDIT: FRESH SYLHET DEMO RESET & OPTIMIZATION PIPELINE");
  console.log("================================================================\n");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env!");
    process.exit(1);
  }

  console.log("📡 Connecting to MongoDB Atlas...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Connected to: ${mongoose.connection.name}\n`);

  // 1. Wipe Old Corrupted / Duplicated Collections
  console.log("🧹 [1/5] Clearing all old test data & duplicates...");
  await ItemReport.deleteMany({});
  await Claim.deleteMany({});
  await Notification.deleteMany({});
  await User.deleteMany({});
  console.log("   ✅ Cleared itemreports, claims, notifications, and users.\n");

  // 2. Seed Verified Users & Admin Account
  console.log("👤 [2/5] Seeding Verified Admin & Campus Users...");
  // User model pre-save hook handles bcrypt hashing automatically
  const defaultPassword = process.env.ADMIN_PASSWORD || "AdminSecure2026!";
  const studentPassword = "Student2026!";

  const admin = await User.create({
    name: process.env.ADMIN_NAME || "Campus Security Admin",
    email: process.env.ADMIN_EMAIL || "admin@campus.edu",
    password: defaultPassword,
    role: "admin",
    studentId: "ADMIN-001",
    phone: "+880 1711-000111",
  });

  const studentUser1 = await User.create({
    name: "Farhan Nowshin",
    email: "fnowshin02@metrouni.edu.bd",
    password: studentPassword,
    role: "student",
    studentId: "MU-2023-CSE-042",
    phone: "+880 1712-345678",
  });

  const studentUser2 = await User.create({
    name: "Tanvir Ahmed",
    email: "tanvir.syl@gmail.com",
    password: studentPassword,
    role: "student",
    studentId: "MU-2022-SWE-089",
    phone: "+880 1819-876543",
  });

  console.log(`   ✅ Admin: ${admin.email}`);
  console.log(`   ✅ User 1: ${studentUser1.email}`);
  console.log(`   ✅ User 2: ${studentUser2.email}\n`);

  // 3. Seed 12 Clean, Distinct, Sylhet-Specific Lost & Found Items
  console.log("📦 [3/5] Seeding 12 Realistic Sylhet Lost & Found Items (with vectors)...");
  const BASE_URL = "http://localhost:5000";

  const sylhetItems = [
    // 1. Apple MacBook Air (Lost)
    {
      type: "lost",
      title: "Space Grey MacBook Air M2 (13-inch)",
      category: "electronics",
      brand: "Apple",
      primaryColor: "Silver / Grey",
      secondaryColor: "Black",
      description: "Space Grey MacBook Air M2 left on a library study table. Has an astronaut sticker on top casing and a slight scratch near the USB-C port.",
      uniqueMarks: "NASA astronaut sticker on lid; small scratch near charging port.",
      secretVerificationDetail: "Wallpaper is anime skyline; serial number ends in M28X.",
      location: {
        campusZone: "lib_main",
        specificLocation: "Metropolitan University Central Library, 2nd Floor Desk 14",
      },
      dateTime: new Date(Date.now() - 2 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_laptop_desk.jpg`],
      imagePaths: ["uploads/bd_laptop_desk.jpg"],
      submitterName: "Farhan Nowshin",
      submitterStudentId: "MU-2023-CSE-042",
      submitterEmail: "fnowshin02@metrouni.edu.bd",
      submitterPhone: "01712345678",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 11),
      textEmbedding: generateNormalizedVector(384, 11),
    },

    // 2. Apple MacBook Found (Matching candidate)
    {
      type: "found",
      title: "Found Space Grey Apple MacBook Laptop",
      category: "electronics",
      brand: "Apple",
      primaryColor: "Silver / Grey",
      secondaryColor: "Black",
      description: "Found an Apple MacBook laptop inside a dark neoprene sleeve on the study desk after library closing. Has stickers on lid.",
      uniqueMarks: "Developer and astronaut stickers on outer lid.",
      secretVerificationDetail: "MacBook Air M2 with anime lockscreen image.",
      location: {
        campusZone: "lib_main",
        specificLocation: "Central Library 2nd Floor Reading Hall",
      },
      dateTime: new Date(Date.now() - 1 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_laptop_desk.jpg`],
      imagePaths: ["uploads/bd_laptop_desk.jpg"],
      submitterName: "Library Caretaker Rafiq",
      submitterStudentId: "STAFF-023",
      submitterEmail: "library.desk@metrouni.edu.bd",
      submitterPhone: "01711002233",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 11.05),
      textEmbedding: generateNormalizedVector(384, 11.08),
    },

    // 3. Black CNG Leather Wallet (Lost)
    {
      type: "lost",
      title: "Lost Black Leather Wallet in Amberkhana-Zindabazar CNG",
      category: "bags_wallets",
      brand: "Apex / Leather",
      primaryColor: "Black",
      secondaryColor: "None",
      description: "Lost my black zippered wallet while riding a green CNG auto-rickshaw from Amberkhana Point to Zindabazar. Slipped from back pocket.",
      uniqueMarks: "Transparent front slot showing student ID card.",
      secretVerificationDetail: "Contains 1,250 Taka cash and national ID card ending with 407.",
      location: {
        campusZone: "syl_zinda",
        specificLocation: "Zindabazar Point drop-off from Amberkhana",
      },
      dateTime: new Date(Date.now() - 5 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/sylhet_cng_wallet.jpg`],
      imagePaths: ["uploads/sylhet_cng_wallet.jpg"],
      submitterName: "Tanvir Ahmed",
      submitterStudentId: "MU-2022-SWE-089",
      submitterEmail: "tanvir.syl@gmail.com",
      submitterPhone: "01819876543",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 22),
      textEmbedding: generateNormalizedVector(384, 22),
    },

    // 4. Black CNG Leather Wallet (Found match)
    {
      type: "found",
      title: "Found Black Leather Wallet in Green CNG Passenger Seat",
      category: "bags_wallets",
      brand: "Apex / Leather",
      primaryColor: "Black",
      secondaryColor: "None",
      description: "Found a black leather wallet left on the green passenger seat of my CNG auto-rickshaw near Zindabazar City Centre. Has money and ID card.",
      uniqueMarks: "Clear ID slot with photo visible.",
      secretVerificationDetail: "1250 Taka cash, NID ending 407.",
      location: {
        campusZone: "syl_zinda",
        specificLocation: "Zindabazar Point (CNG helpline station)",
      },
      dateTime: new Date(Date.now() - 4 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/sylhet_cng_wallet.jpg`],
      imagePaths: ["uploads/sylhet_cng_wallet.jpg"],
      submitterName: "Kalam Mia (CNG Driver)",
      submitterEmail: "cng.helpline.sylhet@gmail.com",
      submitterPhone: "01711234567",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 22.04),
      textEmbedding: generateNormalizedVector(384, 22.06),
    },

    // 5. University Student ID Card (Found)
    {
      type: "found",
      title: "Metropolitan University Student ID Card with Blue Ribbon",
      category: "id_cards",
      brand: "Metropolitan University",
      primaryColor: "Blue / Navy",
      secondaryColor: "White",
      description: "Found a Metropolitan University student identity card inside a transparent plastic card pouch with a navy blue neck lanyard on a classroom wooden bench.",
      uniqueMarks: "Department of CSE printed on ID; blue lanyard with university logo.",
      secretVerificationDetail: "Student Registration ID ending with 5678, valid until Dec 2025.",
      location: {
        campusZone: "syl_mu",
        specificLocation: "Academic Building 1, Room 302, Bateshwar Campus",
      },
      dateTime: new Date(Date.now() - 8 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_student_id.jpg`],
      imagePaths: ["uploads/bd_student_id.jpg"],
      submitterName: "Department Proctor Office",
      submitterEmail: "proctor@metrouni.edu.bd",
      submitterPhone: "01715009988",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 33),
      textEmbedding: generateNormalizedVector(384, 33),
    },

    // 6. University Student ID Card (Lost)
    {
      type: "lost",
      title: "Lost My University Student ID Card with Blue Lanyard",
      category: "id_cards",
      brand: "Metropolitan University",
      primaryColor: "Blue / Navy",
      secondaryColor: "White",
      description: "Misplaced my university student ID card during afternoon CSE lab session. It has a blue lanyard ribbon with plastic casing.",
      uniqueMarks: "Blue ribbon lanyard, 3rd year student card.",
      secretVerificationDetail: "Registration ID ending in 5678.",
      location: {
        campusZone: "syl_mu",
        specificLocation: "Metropolitan University Campus Bateshwar",
      },
      dateTime: new Date(Date.now() - 9 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_student_id.jpg`],
      imagePaths: ["uploads/bd_student_id.jpg"],
      submitterName: "Sabbir Hussain",
      submitterStudentId: "MU-2023-CSE-5678",
      submitterEmail: "sabbir.cse@metrouni.edu.bd",
      submitterPhone: "01718991122",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 33.05),
      textEmbedding: generateNormalizedVector(384, 33.07),
    },

    // 7. Navy Blue Student Backpack at Keane Bridge (Found)
    {
      type: "found",
      title: "Navy Blue Backpack at Surma River View Tea Stall",
      category: "bags_wallets",
      brand: "Fjällräven / Student Bag",
      primaryColor: "Blue / Navy",
      secondaryColor: "Red / Burgundy",
      description: "Found a navy blue student backpack left on a wooden chair at the riverside tea stall cafe near Keane Bridge (Bandarbazar side). Contains books and notebooks.",
      uniqueMarks: "Circular crest patch on front pocket; small enamel pin.",
      secretVerificationDetail: "Contains 3 engineering spiral notebooks and a stainless steel water bottle.",
      location: {
        campusZone: "syl_bandar",
        specificLocation: "Surma River View Cafe beside Keane Bridge, Bandarbazar",
      },
      dateTime: new Date(Date.now() - 14 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/sylhet_cafe_backpack.jpg`],
      imagePaths: ["uploads/sylhet_cafe_backpack.jpg"],
      submitterName: "Kawsar Mia (Tea Stall Owner)",
      submitterEmail: "surma.cafe.sylhet@gmail.com",
      submitterPhone: "01817004455",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 44),
      textEmbedding: generateNormalizedVector(384, 44),
    },

    // 8. Calculus & Analytic Geometry Textbook (Lost)
    {
      type: "lost",
      title: "Anton's Calculus & Analytical Geometry Textbook (10th Ed)",
      category: "books_notes",
      brand: "Wiley / Howard Anton",
      primaryColor: "Blue / Navy",
      secondaryColor: "White",
      description: "Lost hardcover Calculus 10th edition textbook. Left on cafeteria bench during lunch break. Has handwritten solution notes on margins of Chapter 4.",
      uniqueMarks: "Yellow highlighter on integration theorems; student name on inner flyleaf.",
      secretVerificationDetail: "First page has handwritten formula sheet signed 'Farhan'.",
      location: {
        campusZone: "dining_hall",
        specificLocation: "Campus Dining Hall Table 6 near tea counter",
      },
      dateTime: new Date(Date.now() - 18 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_calculus_book.jpg`],
      imagePaths: ["uploads/bd_calculus_book.jpg"],
      submitterName: "Farhan Nowshin",
      submitterStudentId: "MU-2023-CSE-042",
      submitterEmail: "fnowshin02@metrouni.edu.bd",
      submitterPhone: "01712345678",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 55),
      textEmbedding: generateNormalizedVector(384, 55),
    },

    // 9. Calculus Textbook (Found)
    {
      type: "found",
      title: "Found Howard Anton Calculus Textbook in Dining Hall",
      category: "books_notes",
      brand: "Wiley / Howard Anton",
      primaryColor: "Blue / Navy",
      secondaryColor: "White",
      description: "Hardcover blue Calculus textbook found turned in to the dining hall counter staff. Has handwritten notes in margins.",
      uniqueMarks: "Has handwritten formula sheet glued to front cover.",
      secretVerificationDetail: "Name signed 'Farhan' on flyleaf.",
      location: {
        campusZone: "dining_hall",
        specificLocation: "Campus Cafeteria Lost & Found Box",
      },
      dateTime: new Date(Date.now() - 16 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_calculus_book.jpg`],
      imagePaths: ["uploads/bd_calculus_book.jpg"],
      submitterName: "Cafeteria Supervisor Joynal",
      submitterEmail: "dining.lostfound@metrouni.edu.bd",
      submitterPhone: "01719223344",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 55.04),
      textEmbedding: generateNormalizedVector(384, 55.06),
    },

    // 10. Stainless Steel Blue Hydro Flask Bottle (Found)
    {
      type: "found",
      title: "Blue Stainless Steel Insulated Water Bottle (32oz)",
      category: "bottles_accessories",
      brand: "Hydro Flask",
      primaryColor: "Blue / Navy",
      secondaryColor: "Black",
      description: "Found blue insulated water bottle with flex cap left on the sports complex gymnasium bleachers after badminton practice.",
      uniqueMarks: "Small dent on the bottom rim; vinyl mountain sticker on side.",
      secretVerificationDetail: "Mountain outdoor sticker and rubber boot on bottom.",
      location: {
        campusZone: "sports_rec",
        specificLocation: "Indoor Sports Complex, Court 1 bleachers",
      },
      dateTime: new Date(Date.now() - 24 * 3600 * 1000),
      imageUrls: [`${BASE_URL}/uploads/bd_water_bottle.jpg`],
      imagePaths: ["uploads/bd_water_bottle.jpg"],
      submitterName: "Sports Complex Staff Rahim",
      submitterEmail: "sports.desk@metrouni.edu.bd",
      submitterPhone: "01815667788",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 66),
      textEmbedding: generateNormalizedVector(384, 66),
    },

    // 11. Apple AirPods Pro 2nd Gen (Lost)
    {
      type: "lost",
      title: "Apple AirPods Pro 2nd Gen in White MagSafe Case",
      category: "electronics",
      brand: "Apple",
      primaryColor: "White",
      secondaryColor: "None",
      description: "Lost my Apple AirPods Pro 2nd generation inside white charging case. Last seen at the campus auditorium during the CSE tech seminar.",
      uniqueMarks: "Tiny scratch on bottom edge near speaker grille.",
      secretVerificationDetail: "Bluetooth device name is 'Farhan's AirPods Pro'.",
      location: {
        campusZone: "auditorium",
        specificLocation: "Grand Auditorium, Row G Seat 14",
      },
      dateTime: new Date(Date.now() - 30 * 3600 * 1000),
      imageUrls: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80"],
      imagePaths: [],
      submitterName: "Farhan Nowshin",
      submitterStudentId: "MU-2023-CSE-042",
      submitterEmail: "fnowshin02@metrouni.edu.bd",
      submitterPhone: "01712345678",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 77),
      textEmbedding: generateNormalizedVector(384, 77),
    },

    // 12. Car Keys with Red Toyota Lanyard (Found)
    {
      type: "found",
      title: "Key Ring with 3 Keys & Red Toyota Lanyard",
      category: "keys",
      brand: "Toyota / Yale",
      primaryColor: "Black",
      secondaryColor: "Red / Burgundy",
      description: "Found a set of keys with two silver door keys, one padlock key, and a remote key fob attached to a bright red Toyota lanyard ribbon near the parking area.",
      uniqueMarks: "Bright red lanyard with Toyota white lettering.",
      secretVerificationDetail: "Key ring has a small brass miniature whistle attached.",
      location: {
        campusZone: "parking",
        specificLocation: "Main Gate Vehicle Parking Area near Gate 2",
      },
      dateTime: new Date(Date.now() - 36 * 3600 * 1000),
      imageUrls: ["https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80"],
      imagePaths: [],
      submitterName: "Campus Security Gate 2",
      submitterEmail: "security@metrouni.edu.bd",
      submitterPhone: "01711990011",
      status: "active",
      imageEmbedding: generateNormalizedVector(512, 88),
      textEmbedding: generateNormalizedVector(384, 88),
    },
  ];

  const createdItems = await ItemReport.insertMany(sylhetItems);
  console.log(`   ✅ Successfully seeded ${createdItems.length} unique Sylhet items.\n`);

  // 4. Seed 2 Realistic Claim Verification Requests with valid schema
  console.log("📝 [4/5] Seeding 2 Sample Claim Verifications...");
  const macbookFound = createdItems.find((i) => i.title.includes("Found Space Grey"));
  const walletFound = createdItems.find((i) => i.title.includes("Found Black Leather"));

  if (macbookFound) {
    const claim1 = await Claim.create({
      itemId: macbookFound._id,
      claimantId: studentUser1._id,
      secretVerificationAnswer: "Anime skyline wallpaper and serial ending in M28X.",
      proofDetails: "I purchased this MacBook Air M2 last year; the lid has a NASA astronaut sticker on the corner and a developer sticker.",
      status: "pending",
    });

    await Notification.create({
      userId: admin._id,
      type: "system",
      title: "New Ownership Claim Submitted",
      message: `Farhan Nowshin submitted an ownership claim for '${macbookFound.title}'.`,
      relatedItemId: macbookFound._id,
      relatedClaimId: claim1._id,
      isRead: false,
    });
  }

  if (walletFound) {
    const claim2 = await Claim.create({
      itemId: walletFound._id,
      claimantId: studentUser2._id,
      secretVerificationAnswer: "Contains exactly 1250 Taka cash and national ID ending with 407.",
      proofDetails: "Left on the green passenger seat of the CNG when traveling from Amberkhana to Zindabazar. Front clear slot has my student card.",
      status: "approved",
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      reviewNotes: "Verified cash amount and ID details match report perfectly.",
    });

    await Notification.create({
      userId: studentUser2._id,
      type: "claim_approved",
      title: "Your Ownership Claim has been Approved!",
      message: `Your claim for '${walletFound.title}' has been approved by Security Admin. Please collect your item from Zindabazar Point.`,
      relatedItemId: walletFound._id,
      relatedClaimId: claim2._id,
      isRead: false,
    });
  }
  console.log("   ✅ Seeded sample claims and notifications demonstrating verification workflow.\n");

  // 5. Audit Final Database State
  console.log("📊 [5/5] Final Database State Audit:");
  console.log("------------------------------------------------------------------");
  console.log(`   📁 itemreports   : ${await ItemReport.countDocuments()} distinct, verified items`);
  console.log(`   📁 users         : ${await User.countDocuments()} users (Admin + Students)`);
  console.log(`   📁 claims        : ${await Claim.countDocuments()} active claim records`);
  console.log(`   📁 notifications : ${await Notification.countDocuments()} notifications`);
  console.log("------------------------------------------------------------------");

  console.log("\n🎉 DATABASE IS NOW 100% CLEAN, PROFESSIONAL & READY FOR DEMO!");
  console.log("================================================================");

  await mongoose.disconnect();
}

runFreshSylhetReset().catch((err) => {
  console.error("❌ Reset script failed:", err);
  process.exit(1);
});
