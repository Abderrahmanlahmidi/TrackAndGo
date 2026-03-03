import { API_BASE_URL } from "@/constants/Config";
import { Colis } from "@/types/colis";

export const fetchColisByDriver = async (
  driverId: string
): Promise<Colis[]> => {
  const url = `${API_BASE_URL}/colis?driverId=${driverId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  const data: Colis[] = await response.json();
  return data;
};

export const fetchColisById = async (colisId: string): Promise<Colis> => {
  const url = `${API_BASE_URL}/colis/${colisId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  const data: Colis = await response.json();
  return data;
};
