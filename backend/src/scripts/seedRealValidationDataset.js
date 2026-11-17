const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const ItemReport = require("../models/ItemReport");
const User = require("../models/User");

// Deterministic 512-dim and 384-dim normalized vector generator
function generateDeterministicEmbedding(seedStr, dim) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const vec = [];
  for (let i = 0; i < dim; i++) {
    const pseudo = Math.sin(hash + i * 1.618) * 10000;
    vec.push(pseudo - Math.floor(pseudo) - 0.5);
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1.0;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

const REAL_ITEMS = [
  {
    type: "found",
    title: "Found Black Samsung Galaxy Smartphone with Matte Cover",
    category: "electronics",
    brand: "Samsung",
    primaryColor: "Black",
    secondaryColor: "None",
    description: "Found a black Samsung smartphone with a matte back protective cover and a tiny hairline scratch near the camera lens bezel. Left on a table.",
    uniqueMarks: "Has small hairline scratch near bottom-right of camera glass.",
    secretVerificationDetail: "Lockscreen wallpaper shows a golden retriever dog; pin code has 4 digits.",
    campusZone: "Zindabazar Commercial Center (Al-Hamra / Blue Water)",
    specificLocation: "Al-Hamra Shopping City 3rd Floor Food Court",
    image: "/dataset_images/item_01_found.jpg",
    submitterName: "Sylhet Citizen Desk",
    submitterEmail: "helpdesk@sylhetcivic.org",
  },
  {
    type: "found",
    title: "Found Blue Stainless Steel Water Bottle with Silver Cap",
    category: "bottles_accessories",
    brand: "Generic",
    primaryColor: "Blue",
    secondaryColor: "Silver",
    description: "Found an insulated royal blue stainless steel drinking bottle with a brushed silver metallic screw cap. Clean condition with slight dent at bottom.",
    uniqueMarks: "Slight circular dent on the bottom base rim.",
    secretVerificationDetail: "Has a transparent sticker near bottom reading 'Hydro Pure'.",
    campusZone: "Metropolitan University Permanent Campus, Bateshwar",
    specificLocation: "Bateshwar Academic Building A, Ground Floor Bench",
    image: "/dataset_images/item_02_found.jpg",
    submitterName: "Tanvir Ahmed",
    submitterEmail: "tanvir.student@campus.edu",
  },
  {
    type: "found",
    title: "Found Gray Urban Backpack with Dual Front Zip Pockets",
    category: "bags_wallets",
    brand: "None",
    primaryColor: "Gray",
    secondaryColor: "Black",
    description: "Found a durable gray fabric everyday backpack featuring two distinct horizontal front zipper compartments and black woven zipper pulls.",
    uniqueMarks: "Left shoulder strap has a small yellow reflective strip stitched on it.",
    secretVerificationDetail: "Inside inner zip pocket contains a pair of wire earphones and a USB drive.",
    campusZone: "Amberkhana Point & Airport Road Junction",
    specificLocation: "Airport Road CNG Passenger Stand Waiting Bench",
    image: "/dataset_images/item_03_found.jpg",
    submitterName: "Farhan Chowdhury",
    submitterEmail: "farhan.sylhet@gmail.com",
  },
  {
    type: "found",
    title: "Found Brown Genuine Leather Bi-fold Wallet",
    category: "bags_wallets",
    brand: "None",
    primaryColor: "Brown",
    secondaryColor: "Tan",
    description: "Found a classic dark brown genuine leather men's wallet with perimeter contrast stitching and multiple credit card sleeves.",
    uniqueMarks: "Small scuff mark on top spine edge.",
    secretVerificationDetail: "Contains an Sonali Bank ATM card and a medical clinic receipt.",
    campusZone: "Shahi Eidgah & Kumarpara Area",
    specificLocation: "Shahi Eidgah Mosque Gate 2 Plaza",
    image: "/dataset_images/item_04_found.jpg",
    submitterName: "Nawshin Fariha",
    submitterEmail: "fnowshin02@gmail.com",
  },
  {
    type: "found",
    title: "Found White JBL Wireless Bluetooth Earbuds in Charging Case",
    category: "electronics",
    brand: "JBL",
    primaryColor: "White",
    secondaryColor: "White",
    description: "Found a pair of glossy white true wireless earbuds resting securely inside their compact oval magnetic charging dock.",
    uniqueMarks: "Small microscopic dot indentation on the lid opening rim.",
    secretVerificationDetail: "Bluetooth device broadcast name is 'JBL Tune 130-User'.",
    campusZone: "Shahjalal University Campus & Surma Gate",
    specificLocation: "Central Library Reading Hall, 2nd Floor",
    image: "/dataset_images/item_05_found.jpg",
    submitterName: "Tanvir Ahmed",
    submitterEmail: "tanvir.student@campus.edu",
  },
  {
    type: "found",
    title: "Found Black Casio Scientific Calculator with Hard Case",
    category: "books_notes",
    brand: "Casio",
    primaryColor: "Black",
    secondaryColor: "Silver",
    description: "Found a black Casio scientific engineering calculator with original protective sliding cover. Display screen intact.",
    uniqueMarks: "Inside sliding cover has a periodic table sticker.",
    secretVerificationDetail: "Back battery casing has student initials 'M.R.' written in white ink.",
    campusZone: "Metropolitan University Permanent Campus, Bateshwar",
    specificLocation: "CSE Lab 304, Computer Station #12",
    image: "/dataset_images/item_06_found.jpg",
    submitterName: "Sylhet Citizen Desk",
    submitterEmail: "helpdesk@sylhetcivic.org",
  },
  {
    type: "found",
    title: "Found Silver Keyring with Physical Door Keys & Red Tag",
    category: "keys",
    brand: "None",
    primaryColor: "Silver",
    secondaryColor: "Red",
    description: "Found a split-ring silver keychain with three standard brass/silver door keys and a small rectangular red plastic identification tag.",
    uniqueMarks: "One key is a dimple cylinder security key.",
    secretVerificationDetail: "Red tag has house unit number 'B-3' handwritten in ballpoint.",
    campusZone: "Zindabazar Commercial Center (Al-Hamra / Blue Water)",
    specificLocation: "Blue Water Shopping Complex Escalator Landing",
    image: "/dataset_images/item_07_found.jpg",
    submitterName: "Nawshin Fariha",
    submitterEmail: "fnowshin02@gmail.com",
  },
  {
    type: "found",
    title: "Found Black Automatic Windproof Folding Umbrella",
    category: "bottles_accessories",
    brand: "None",
    primaryColor: "Black",
    secondaryColor: "Black",
    description: "Found a compact folding rain umbrella with curved wooden handle, push-button automatic deployment, and 8 fiberglass ribs.",
    uniqueMarks: "Small reflective silver strap stitched onto outer sleeve cover.",
    secretVerificationDetail: "Push button on handle is brass-colored and snaps cleanly.",
    campusZone: "Metropolitan University Permanent Campus, Bateshwar",
    specificLocation: "Main Library Entrance Umbrella Stand",
    image: "/dataset_images/item_08_found.jpg",
    submitterName: "Sylhet City Admin",
    submitterEmail: "admin@campus.edu",
  },
  {
    type: "found",
    title: "Found Blue Fabric Lanyard ID Card Holder",
    category: "id_cards",
    brand: "None",
    primaryColor: "Blue",
    secondaryColor: "Clear",
    description: "Found a blue braided lanyard strap with metal swivel lobster clasp and clear PVC cardholder pouch.",
    uniqueMarks: "Lanyard fabric has dark navy border stitching.",
    secretVerificationDetail: "Contains a blood group donor card tucked behind the main card.",
    campusZone: "Shahjalal University Campus & Surma Gate",
    specificLocation: "Surma Gate Passenger Shed",
    image: "/dataset_images/item_09_found.jpg",
    submitterName: "Farhan Chowdhury",
    submitterEmail: "farhan.sylhet@gmail.com",
  },
  {
    type: "found",
    title: "Found Fastrack Silver Metallic Analog Wristwatch",
    category: "other",
    brand: "Fastrack",
    primaryColor: "Silver",
    secondaryColor: "Black",
    description: "Found an all-metal stainless steel analog wristwatch with mesh magnetic clasp and round midnight black dial.",
    uniqueMarks: "Rear stainless steel caseback engraved with model serial number.",
    secretVerificationDetail: "Mesh strap has a tiny extra link removed on the 6 o'clock side.",
    campusZone: "Zindabazar Commercial Center (Al-Hamra / Blue Water)",
    specificLocation: "City Center Millennium Market Walkway",
    image: "/dataset_images/item_10_found.jpg",
    submitterName: "Nawshin Fariha",
    submitterEmail: "fnowshin02@gmail.com",
  },
];

async function seedRealDataset() {
  console.log("==================================================");
  console.log("🚀 SEEDING REAL VALIDATION DATASET INTO ATLAS");
  console.log("==================================================\n");

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to database: ${mongoose.connection.name}`);

  // Fetch admin user ID
  const admin = await User.findOne({ email: "admin@campus.edu" });
  const adminId = admin ? admin._id : null;

  let inserted = 0;
  let updated = 0;

  for (const item of REAL_ITEMS) {
    const existing = await ItemReport.findOne({ title: item.title });

    const visualEmbedding = generateDeterministicEmbedding(item.title + item.image, 512);
    const textEmbedding = generateDeterministicEmbedding(item.description + item.brand, 384);

    const doc = {
      type: item.type,
      title: item.title,
      category: item.category,
      brand: item.brand,
      primaryColor: item.primaryColor,
      secondaryColor: item.secondaryColor,
      description: item.description,
      uniqueMarks: item.uniqueMarks,
      secretVerificationDetail: item.secretVerificationDetail,
      location: {
        campusZone: item.campusZone,
        specificLocation: item.specificLocation,
      },
      dateTime: new Date(Date.now() - Math.floor(Math.random() * 48 + 2) * 3600 * 1000),
      imageUrls: [item.image],
      imagePaths: [],
      imageEmbedding: visualEmbedding,
      textEmbedding: textEmbedding,
      submitterId: adminId,
      submitterName: item.submitterName,
      submitterStudentId: "SYL-2026-VAL",
      submitterEmail: item.submitterEmail,
      status: "active",
    };

    if (existing) {
      await ItemReport.updateOne({ _id: existing._id }, { $set: doc });
      console.log(`Updated existing item: ${item.title}`);
      updated++;
    } else {
      await ItemReport.create(doc);
      console.log(`Inserted new item: ${item.title}`);
      inserted++;
    }
  }

  const total = await ItemReport.countDocuments();
  console.log(`\n🎉 Seeding Completed! Added: ${inserted}, Updated: ${updated}. Total in DB: ${total}`);

  await mongoose.disconnect();
}

seedRealDataset().catch(console.error);
