const API_BASE_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"
    : "http://flask_app:5050";

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar a mensagem padrão
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Tratar erros de rede (Failed to fetch)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Não foi possível conectar ao servidor. Verifique se o servidor está rodando em ${API_BASE_URL}`
      );
    }
    // Re-lançar outros erros
    throw error;
  }
}

export async function apiPost<T>(
  path: string,
  data: Record<string, unknown>
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar a mensagem padrão
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Tratar erros de rede (Failed to fetch)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Não foi possível conectar ao servidor. Verifique se o servidor está rodando em ${API_BASE_URL}`
      );
    }
    // Re-lançar outros erros
    throw error;
  }
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}

export async function updatePassword(
  data: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> {
  return apiPost<UpdatePasswordResponse>("/auth/update-password", data);
}
