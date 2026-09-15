import type { Subscriber } from "@/types/subscriber";

/** Same record in DB — every subscriber is a customer; not every customer has a subscription yet */
export type Customer = Subscriber;

export type CustomerKind = "customer" | "subscriber" | "stopped";
