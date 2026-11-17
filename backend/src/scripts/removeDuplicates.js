const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const ItemReport = require("../models/ItemReport");

async function removeDuplicatePairs() {
  console.log("==================================================");
  console.log("🧹 DEDUPLICATING ITEM REPORTS (KEEPING 100% UNIQUE ITEMS)");
  console.log("==================================================\n");

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected to: ${mongoose.connection.name}`);

  // Delete matching paired duplicates so every physical item is unique
  // 1. Remove the duplicate lost MacBook, keep the found one
  const r1 = await ItemReport.deleteOne({ title: { $regex: /Space Grey MacBook Air M2 \(13-inch\)/i } });
  
  // 2. Remove the duplicate lost wallet, keep the found one
  const r2 = await ItemReport.deleteOne({ title: { $regex: /Lost Black Leather Wallet in Amberkhana-Zindabazar CNG/i } });
  
  // 3. Remove the duplicate lost student ID, keep the found one
  const r3 = await ItemReport.deleteOne({ title: { $regex: /Lost My University Student ID Card with Blue Lanyard/i } });
  
  // 4. Remove the duplicate lost calculus book, keep the found one
  const r4 = await ItemReport.deleteOne({ title: { $regex: /Anton's Calculus & Analytical Geometry Textbook \(10th Ed\)/i } });

  console.log(`Removed duplicate MacBook pair: ${r1.deletedCount}`);
  console.log(`Removed duplicate Wallet pair: ${r2.deletedCount}`);
  console.log(`Removed duplicate Student ID pair: ${r3.deletedCount}`);
  console.log(`Removed duplicate Calculus book pair: ${r4.deletedCount}`);

  // Now add two brand-new unique distinct items so feed has 10 completely diverse items
  const BASE_URL = "http://localhost:5000";
  const existingCalc = await ItemReport.findOne({ title: { $regex: /ClassWiz/i } });
  if (!existingCalc) {
    await ItemReport.create({
      type: "lost",
      title: "Casio fx-991EX ClassWiz Scientific Calculator",
      category: "electronics",
      brand: "Casio",
      primaryColor: "Black",
      secondaryColor: "White",
      description: "Lost black Casio fx-991EX ClassWiz scientific calculator inside slide-on hard cover. Left in CSE Building Examination Hall 301.",
      uniqueMarks: "Has small silver sticker with 'SUST-MATH' initials on back cover.",
      secretVerificationDetail: "Battery compartment has name 'Tanvir' written with permanent marker.",
      location: {
        campusZone: "syl_mu",
        specificLocation: "Metropolitan University Bateshwar Campus, Room 301",
      },
      dateTime: new Date(Date.now() - 6 * 3600 * 1000),
      imageUrls: ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80"],
      imagePaths: [],
      submitterName: "Tanvir Ahmed",
      submitterStudentId: "MU-2022-SWE-089",
      submitterEmail: "tanvir.syl@gmail.com",
      status: "active",
    });
    console.log("Added unique: Casio Scientific Calculator");
  }

  const existingUmbrella = await ItemReport.findOne({ title: { $regex: /Umbrella/i } });
  if (!existingUmbrella) {
    await ItemReport.create({
      type: "found",
      title: "Black Automatic Folding Windproof Umbrella",
      category: "clothing",
      brand: "Rainbird / Classic",
      primaryColor: "Black",
      secondaryColor: "Silver / Grey",
      description: "Found a black compact folding automatic umbrella with wooden curved handle left in the umbrella stand at Main Library entrance.",
      uniqueMarks: "Wooden handle with brass push button.",
      secretVerificationDetail: "Small silver reflective strap on outer sleeve.",
      location: {
        campusZone: "lib_main",
        specificLocation: "Library Entrance Reception Umbrella Rack",
      },
      dateTime: new Date(Date.now() - 10 * 3600 * 1000),
      imageUrls: ["https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80"],
      imagePaths: [],
      submitterName: "Library Entrance Desk",
      submitterEmail: "library.desk@metrouni.edu.bd",
      status: "active",
    });
    console.log("Added unique: Black Windproof Umbrella");
  }

  const remaining = await ItemReport.find({}, 'title type category');
  console.log("\n--- Final 100% Unique Items in Database ---");
  remaining.forEach((item, i) => {
    console.log(`${i + 1}. [${item.type.toUpperCase()}] ${item.title} (${item.category})`);
  });

  await mongoose.disconnect();
  console.log("\n✅ DEDUPLICATION COMPLETE!");
}

removeDuplicatePairs().catch(console.error);
