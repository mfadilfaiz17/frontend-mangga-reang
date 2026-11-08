export type Role = "ADMIN_GUDANG" | "PETANI" | "BUYER_B2B";

export type UserResponse = {
  id: number;
  email: string;
  namaLengkap: string;
  role: Role;
  namaPerusahaan: string | null;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
};

export type Inventory = {
  id: number;
  idPetani: number;
  varietas: string;
  grade: string;
  tonaseTersedia: number;
  hargaPerTon: number;
  lokasiKebun: string;
  isActive: boolean;
};

export type Rfq = {
  id: number;
  idBuyer: number;
  idMangga: number;
  tonaseDiminta: number;
  statusNego: string;
  totalHarga: number;
  tanggalPesanan: string;
};

export type TrackingEvent = {
  id: number;
  idRfq: number;
  statusMilestone: string;
  catatanQc: string | null;
  updatedAt: string;
  updatedBy: number;
};

export type Variety = "GEDONG_GINCU" | "CENGKIR" | "HARUMANIS";
export type Grade = "GRADE_A" | "GRADE_B" | "GRADE_C";
export type LogisticsMilestone =
  | "DIPROSES_PETANI"
  | "SORTIR_GUDANG"
  | "IN_TRANSIT"
  | "DELIVERED";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      body?.detail ?? `Request gagal (${response.status})`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  namaLengkap: string;
  role: Exclude<Role, "ADMIN_GUDANG">;
  namaPerusahaan?: string;
}) {
  return apiFetch<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(email: string, password: string) {
  const response = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem("accessToken", response.accessToken);
  try {
    const user = await getCurrentUser();
    window.localStorage.setItem("currentUser", JSON.stringify(user));
    window.dispatchEvent(new Event("auth:changed"));
    return { ...response, user };
  } catch (error) {
    clearSession();
    throw error;
  }
}

export function isAuthenticated() {
  return typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("accessToken"));
}

export async function getCurrentUser() {
  return apiFetch<UserResponse>("/auth/me");
}

export async function updateCurrentUser(payload: {
  namaLengkap: string;
  namaPerusahaan: string | null;
}) {
  const user = await apiFetch<UserResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  window.localStorage.setItem("currentUser", JSON.stringify(user));
  window.dispatchEvent(new Event("auth:changed"));
  return user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  return apiFetch<void>("/auth/me/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function requestPasswordReset(email: string) {
  return apiFetch<{ detail: string }>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
) {
  return apiFetch<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function getInventory(filters: {
  varietas?: Variety;
  grade?: Grade;
  lokasi?: string;
} = {}) {
  const params = new URLSearchParams({ offset: "0", limit: "100" });
  if (filters.varietas) params.set("varietas", filters.varietas);
  if (filters.grade) params.set("grade", filters.grade);
  if (filters.lokasi) params.set("lokasi", filters.lokasi);
  return apiFetch<Inventory[]>(`/mangga/?${params.toString()}`);
}

export async function getMyInventory() {
  return apiFetch<Inventory[]>("/mangga/me?offset=0&limit=100");
}

export async function createInventory(payload: {
  varietas: Variety;
  grade: Grade;
  tonaseTersedia: number;
  hargaPerTon: number;
  lokasiKebun: string;
}) {
  return apiFetch<Inventory>("/mangga/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAllRfqs() {
  return apiFetch<Rfq[]>("/rfq/all?offset=0&limit=100");
}

export async function approveRfq(rfqId: number) {
  return apiFetch<Rfq>(`/rfq/${rfqId}/approve`, { method: "PUT" });
}

export async function rejectRfq(rfqId: number) {
  return apiFetch<Rfq>(`/rfq/${rfqId}/reject`, { method: "PUT" });
}

export async function completeRfq(rfqId: number) {
  return apiFetch<Rfq>(`/rfq/${rfqId}/complete`, { method: "PUT" });
}

export async function updateTracking(
  rfqId: number,
  statusMilestone: LogisticsMilestone,
  catatanQc: string,
) {
  return apiFetch<TrackingEvent>(`/logistik/${rfqId}/update-status`, {
    method: "POST",
    body: JSON.stringify({ statusMilestone, catatanQc: catatanQc || null }),
  });
}

export async function createRfq(idMangga: number, tonaseDiminta: number) {
  return apiFetch<Rfq>("/rfq/", {
    method: "POST",
    body: JSON.stringify({ idMangga, tonaseDiminta }),
  });
}

export async function getMyRfqs() {
  return apiFetch<Rfq[]>("/rfq/me?offset=0&limit=100");
}

export async function getTracking(rfqId: number) {
  return apiFetch<TrackingEvent[]>(
    `/logistik/${rfqId}?offset=0&limit=100`,
  );
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("auth:changed"));
  }
}
