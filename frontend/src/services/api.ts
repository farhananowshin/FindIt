import { StoredItemReport, ReportType, ItemCategory } from "../types/item";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Normalizes raw MongoDB document from the backend into frontend StoredItemReport shape.
 */
export function normalizeItemReport(raw: Record<string, unknown>): StoredItemReport {
  const locationObj =
    raw.location && typeof raw.location === "object"
      ? (raw.location as Record<string, unknown>)
      : undefined;

  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const rawImageUrls = Array.isArray(raw.imageUrls)
    ? (raw.imageUrls as string[])
    : [];
  const rawImagePaths = Array.isArray(raw.imagePaths)
    ? (raw.imagePaths as string[])
    : [];

  const typeVal = ((raw.type || raw.reportType || "lost") as string).toLowerCase() as ReportType;
  const categoryVal = ((raw.category || "other") as string).toLowerCase() as ItemCategory;

  return {
    id: (raw._id || raw.id || `ITEM-${Math.random().toString(36).substring(2, 8)}`) as string,
    _id: raw._id as string | undefined,
    type: typeVal,
    reportType: typeVal,
    title: (raw.title || "Untitled Item") as string,
    category: categoryVal,
    brand: (raw.brand || "") as string,
    primaryColor: (raw.primaryColor || "Black") as string,
    secondaryColor: (raw.secondaryColor || "None") as string,
    campusLocation:
      ((locationObj?.campusZone || raw.campusLocation || "lib_main") as string),
    specificLocation:
      ((locationObj?.specificLocation || raw.specificLocation || "Campus") as string),
    location: locationObj
      ? {
          campusZone: (locationObj.campusZone || "") as string,
          specificLocation: (locationObj.specificLocation || "") as string,
        }
      : undefined,
    dateTime: (raw.dateTime || raw.createdAt || new Date().toISOString()) as string,
    description: (raw.description || "") as string,
    uniqueMarks: (raw.uniqueMarks || "") as string,
    // Note: secretVerificationDetail is intentionally omitted by backend security rules
    secretVerificationHint: (raw.secretVerificationDetail || raw.secretVerificationHint || "") as string,
    reporterName: (raw.submitterName || raw.reporterName || "Anonymous") as string,
    submitterName: raw.submitterName as string | undefined,
    studentId: (raw.submitterStudentId || raw.studentId || "") as string,
    contactEmail: (raw.submitterEmail || raw.contactEmail || "") as string,
    contactPhone: (raw.submitterPhone || raw.contactPhone || "") as string,
    imageUrls: rawImageUrls,
    imagePaths: rawImagePaths,
    images: rawImageUrls.length > 0
      ? rawImageUrls.map((url: string, index: number) => ({
          id: `img-${index}-${Date.now()}`,
          name: url.split("/").pop() || `Photo ${index + 1}`,
          size: 0,
          previewUrl: url,
        }))
      : rawImages,
    createdAt: (raw.createdAt || new Date().toISOString()) as string,
    updatedAt: raw.updatedAt as string | undefined,
    status: (raw.status || "active") as "active" | "open" | "under_review" | "matched" | "claimed" | "resolved",
  };
}

/**
 * Check backend and MongoDB connectivity.
 */
export async function checkBackendHealth(): Promise<{
  isOnline: boolean;
  databaseStatus: string;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return { isOnline: false, databaseStatus: "unhealthy" };
    }

    const data = await res.json();
    return {
      isOnline: true,
      databaseStatus: data.database?.status || "unknown",
      message: data.service,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reach backend server.";
    return {
      isOnline: false,
      databaseStatus: "disconnected",
      message,
    };
  }
}

/**
 * Fetch items list from backend MongoDB with optional filters.
 */
export async function fetchItems(filters?: {
  type?: string;
  category?: string;
  status?: string;
  search?: string;
}): Promise<StoredItemReport[]> {
  const queryParams = new URLSearchParams();
  if (filters?.type && filters.type !== "all") queryParams.append("type", filters.type);
  if (filters?.category && filters.category !== "all") queryParams.append("category", filters.category);
  if (filters?.status && filters.status !== "all") queryParams.append("status", filters.status);
  if (filters?.search && filters.search.trim()) queryParams.append("search", filters.search.trim());

  const url = `${API_BASE}/api/items${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let errMessage = `Error ${res.status}: Failed to fetch items`;
    try {
      const errJson = await res.json();
      if (errJson.message) errMessage = errJson.message;
    } catch {}
    throw new Error(errMessage);
  }

  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("Invalid API response format from backend.");
  }

  return json.data.map((item: Record<string, unknown>) => normalizeItemReport(item));
}

/**
 * Submit a new item report using FormData (supporting image files).
 */
export async function submitItemReport(formData: FormData, token?: string): Promise<StoredItemReport> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg = json.message || (json.errors ? json.errors.join(", ") : "Failed to create report");
    throw new Error(errorMsg);
  }

  return normalizeItemReport(json.data as Record<string, unknown>);
}

/**
 * Fetch a single item report by ID.
 */
export async function fetchItemById(id: string): Promise<StoredItemReport> {
  const res = await fetch(`${API_BASE}/api/items/${id}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Failed to fetch item ${id}`);
  }

  return normalizeItemReport(json.data as Record<string, unknown>);
}

/**
 * Fetch explainable AI matches for a specific Lost item report.
 */
export async function fetchMatchesForItem(
  id: string,
  topK = 5
): Promise<import("../types/item").MatchResponse> {
  const res = await fetch(`${API_BASE}/api/items/${id}/matches?topK=${topK}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Failed to fetch AI matches for report ${id}`);
  }

  return json;
}

// ==========================================
// Day 4: Authentication & Claims API Client
// ==========================================

import { UserProfile, AuthResponse, Claim, CreateClaimPayload, ClaimStatus } from "../types/item";

/**
 * Register a new student account.
 */
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Registration failed.");
  }

  return json;
}

/**
 * Authenticate existing user with email and password.
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Invalid email or password.");
  }

  return json;
}

/**
 * Fetch profile for the currently authenticated user.
 */
export async function fetchCurrentUser(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch user profile.");
  }

  return json.user;
}

/**
 * Submit an ownership claim for a found item.
 */
export async function submitClaim(
  payload: CreateClaimPayload,
  token: string
): Promise<{ success: boolean; message: string; data: Partial<Claim> }> {
  const res = await fetch(`${API_BASE}/api/claims`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to submit ownership claim.");
  }

  return json;
}

/**
 * Fetch all claims filed by the currently authenticated student.
 */
export async function fetchMyClaims(token: string): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/claims/my-claims`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to retrieve your claims.");
  }

  return json.data || [];
}

/**
 * Fetch all claims for admin review.
 */
export async function fetchAdminClaims(
  token: string,
  status?: string
): Promise<{ total: number; data: Claim[] }> {
  const query = status && status !== "all" ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/api/claims${query}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch claims for administrative review.");
  }

  return { total: json.total || 0, data: json.data || [] };
}

/**
 * Approve or reject a claim (Admin only).
 */
export async function updateClaimStatus(
  claimId: string,
  status: ClaimStatus,
  reviewNotes: string,
  token: string
): Promise<{ success: boolean; message: string; data: { claim: Claim; itemStatus: string } }> {
  const res = await fetch(`${API_BASE}/api/claims/${claimId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reviewNotes }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update claim review status.");
  }

  return json;
}

