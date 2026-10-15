export type ReportType = "lost" | "found";

export type ItemCategory =
  | "electronics"
  | "id_cards"
  | "keys"
  | "bags_wallets"
  | "clothing"
  | "books_notes"
  | "bottles_accessories"
  | "other";

export interface CampusLocation {
  id: string;
  name: string;
  zone: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  file?: File;
}

export interface ItemReportFormData {
  reportType: ReportType;
  title: string;
  category: ItemCategory;
  brand: string;
  primaryColor: string;
  secondaryColor: string;
  campusLocation: string;
  specificLocation: string;
  dateTime: string;
  description: string;
  uniqueMarks: string;
  secretVerificationHint: string;
  reporterName: string;
  studentId: string;
  contactEmail: string;
  contactPhone: string;
  images: UploadedImage[];
}

export interface StoredItemReport {
  id: string;
  _id?: string;
  type?: ReportType;
  reportType: ReportType;
  title: string;
  category: ItemCategory;
  brand: string;
  primaryColor: string;
  secondaryColor: string;
  campusLocation: string;
  specificLocation: string;
  location?: {
    campusZone: string;
    specificLocation: string;
  };
  dateTime: string;
  description: string;
  uniqueMarks?: string;
  secretVerificationHint?: string;
  reporterName?: string;
  submitterName?: string;
  studentId?: string;
  submitterStudentId?: string;
  contactEmail?: string;
  submitterEmail?: string;
  contactPhone?: string;
  submitterPhone?: string;
  images: UploadedImage[];
  imageUrls?: string[];
  imagePaths?: string[];
  createdAt: string;
  updatedAt?: string;
  status: "open" | "active" | "under_review" | "matched" | "claimed" | "resolved";
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { id: "lib_main", name: "Central University Library", zone: "Academic Core" },
  { id: "sci_eng", name: "Science & Engineering Complex", zone: "North Campus" },
  { id: "stu_union", name: "Student Union & Activity Center", zone: "Central Campus" },
  { id: "dining_hall", name: "Campus Cafeteria & Dining Hall", zone: "Central Campus" },
  { id: "sports_rec", name: "Sports & Recreation Center", zone: "South Campus" },
  { id: "dorm_east", name: "East Campus Residence Halls", zone: "Residential East" },
  { id: "dorm_west", name: "West Campus Residence Halls", zone: "Residential West" },
  { id: "auditorium", name: "Grand Auditorium & Hall A-C", zone: "Arts & Humanities" },
  { id: "admin_bldg", name: "Administration & Registrar Building", zone: "Central Campus" },
  { id: "bus_stop", name: "Campus Shuttle Terminal / Bus Stop", zone: "Transit" },
  { id: "other", name: "Other Campus Location", zone: "Campus Perimeter" },
];

export const ITEM_CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: "electronics", label: "Electronics (Laptops, Phones, Earbuds)", icon: "Laptop" },
  { id: "id_cards", label: "Student IDs, Cards & Documents", icon: "CreditCard" },
  { id: "keys", label: "Keys & Keychains", icon: "Key" },
  { id: "bags_wallets", label: "Backpacks, Purses & Wallets", icon: "Briefcase" },
  { id: "clothing", label: "Clothing, Jackets & Hats", icon: "Shirt" },
  { id: "books_notes", label: "Textbooks, Notebooks & Stationary", icon: "BookOpen" },
  { id: "bottles_accessories", label: "Water Bottles, Umbrellas & Glasses", icon: "Coffee" },
  { id: "other", label: "Other Miscellaneous Items", icon: "HelpCircle" },
];

export const COMMON_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Silver / Grey", hex: "#94a3b8" },
  { name: "Blue / Navy", hex: "#2563eb" },
  { name: "Red / Burgundy", hex: "#dc2626" },
  { name: "Green", hex: "#16a34a" },
  { name: "Yellow / Gold", hex: "#eab308" },
  { name: "Brown / Tan", hex: "#854d0e" },
  { name: "Purple / Pink", hex: "#c026d3" },
  { name: "Orange", hex: "#ea580c" },
];
