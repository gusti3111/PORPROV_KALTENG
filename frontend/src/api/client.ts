import axios from "axios";

type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api/v1"
).replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
});

export async function getAPIData<T>(path: string): Promise<T> {
  const response = await apiClient.get<APIResponse<T>>(path);
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.error || "API mengembalikan respons yang tidak valid.");
  }
  return response.data.data;
}

export function getAPIErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return (
      error.response?.data?.error ||
      error.message ||
      "Tidak dapat menghubungi server."
    );
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
}
