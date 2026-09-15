import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { mapSpeedTierRecord, mapSpeedsResponse } from "@/lib/mapSpeedTiers";
import type { SpeedTier, SpeedsListResponse, SpeedTierResponse } from "@/types/speeds";

export const speedsService = {
  async list(): Promise<SpeedTier[]> {
    const response = await apiGet<SpeedsListResponse>("/speeds");
    return mapSpeedsResponse(response.data ?? []);
  },

  async create(speedValue: number, price: number): Promise<SpeedTier> {
    const response = await apiPost<SpeedTierResponse>("/speeds", { speedValue, price });
    if (!response.data) {
      throw new Error("Invalid speed response");
    }
    return mapSpeedTierRecord({
      ...response.data,
      deleted: false,
      createdAt: new Date().toISOString(),
      availableUsernamesCount: 0,
      usedUsernamesCount: 0,
    });
  },

  async update(id: number, speedValue: number, price: number): Promise<SpeedTier> {
    const response = await apiPut<SpeedTierResponse>(`/speeds/${id}`, {
      speed: speedValue,
      price,
    });
    if (!response.data) {
      throw new Error("Invalid speed response");
    }
    return mapSpeedTierRecord({
      ...response.data,
      deleted: false,
      createdAt: new Date().toISOString(),
      availableUsernamesCount: 0,
      usedUsernamesCount: 0,
    });
  },

  async remove(id: number): Promise<void> {
    await apiDelete(`/speeds/${id}`);
  },
};
