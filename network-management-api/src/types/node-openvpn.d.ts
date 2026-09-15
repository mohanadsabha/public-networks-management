declare module 'node-openvpn' {
  import { EventEmitter } from 'events';

  interface OpenVpnOpts {
    host: string;
    port: number;
    logpath?: string;
  }

  interface Auth {
    user: string;
    pass: string;
  }

  interface OpenVpnManager extends EventEmitter {
    // events: 'connected', 'console-output', 'state-change', 'error'
    on(event: 'connected', listener: () => void): this;
    on(event: 'console-output', listener: (output: string) => void): this;
    on(event: 'state-change', listener: (state: string[]) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }

  // The module exports these top‑level functions
  export function connect(opts: OpenVpnOpts): OpenVpnManager;
  export function authorize(auth: Auth): void;
  export function disconnect(): void;
}