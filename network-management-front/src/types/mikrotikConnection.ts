export type MikrotikConnectionMethod = "API" | "SSH";

export interface MikrotikConnectionStatus {
  connected: boolean;
  connectedTo: MikrotikConnectionMethod | null;
  onlineCount: number;
}
