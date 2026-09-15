import { addDays, subDays } from "date-fns";
import type {
  SpeedHistoryEntry,
  Subscriber,
  SubscriberInvoice,
  UsernameHistoryEntry,
} from "@/types/subscriber";

const today = new Date();

function isoDate(daysOffset: number): string {
  return subDays(today, daysOffset).toISOString().slice(0, 10);
}

export function disconnectFromFirstContact(firstContact: string): string {
  return addDays(parseDate(firstContact), 30).toISOString().slice(0, 10);
}

function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export const FACILITY_TYPE_OPTIONS = [
  "منزل",
  "محل تجاري",
  "شركة",
  "مؤسسة تعليمية",
  "أخرى",
] as const;

export const PACKAGE_LINE_OPTIONS = [4, 8, 16, 32, 64] as const;

export const mockSubscribers: Subscriber[] = [
  {
    id: 1,
    lineId: "W04-101",
    username: "0599123456PP",
    password: "pass101x",
    fullName: "أحمد خليل موسى",
    facilityType: "منزل",
    phone: "0599123456",
    packageLine: 4,
    speedMbps: 4,
    monthlyPrice: 120,
    startDate: isoDate(120),
    firstContactDate: isoDate(10),
    disconnectionDate: disconnectFromFirstContact(isoDate(10)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: -45,
    notes: "يفضل الاتصال صباحاً",
    createdAt: subDays(today, 120).toISOString(),
    updatedAt: subDays(today, 2).toISOString(),
  },
  {
    id: 2,
    lineId: "W08-205",
    username: "0598765432PP",
    password: "wifi205!",
    fullName: "ليلى منصور",
    facilityType: "محل تجاري",
    phone: "0598765432",
    packageLine: 8,
    speedMbps: 8,
    monthlyPrice: 160,
    startDate: isoDate(90),
    firstContactDate: isoDate(5),
    disconnectionDate: disconnectFromFirstContact(isoDate(5)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: 0,
    notes: null,
    createdAt: subDays(today, 90).toISOString(),
    updatedAt: subDays(today, 5).toISOString(),
  },
  {
    id: 3,
    lineId: "W16-042",
    username: "0599111222PP",
    password: "net042ab",
    fullName: "عمر حداد",
    facilityType: "شركة",
    phone: "0599111222",
    packageLine: 16,
    speedMbps: 16,
    monthlyPrice: 250,
    startDate: isoDate(200),
    firstContactDate: isoDate(28),
    disconnectionDate: disconnectFromFirstContact(isoDate(28)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: true,
    balance: 120,
    notes: "اسم مالك — لا ينتهي",
    createdAt: subDays(today, 200).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
  },
  {
    id: 4,
    lineId: "W04-088",
    username: null,
    password: null,
    fullName: "نور صالح",
    facilityType: "منزل",
    phone: "0599333444",
    packageLine: 4,
    speedMbps: 4,
    monthlyPrice: 120,
    startDate: isoDate(3),
    firstContactDate: null,
    disconnectionDate: null,
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: 0,
    notes: "زبون جديد — بانتظار تعيين اسم مستخدم",
    createdAt: subDays(today, 3).toISOString(),
    updatedAt: subDays(today, 3).toISOString(),
  },
  {
    id: 5,
    lineId: "W32-017",
    username: "0599444555PP",
    password: "speed32x",
    fullName: "يوسف درويش",
    facilityType: "منزل",
    phone: "0599444555",
    packageLine: 32,
    speedMbps: 32,
    monthlyPrice: 160,
    startDate: isoDate(60),
    firstContactDate: isoDate(2),
    disconnectionDate: disconnectFromFirstContact(isoDate(2)),
    isActive: true,
    isSuspended: true,
    isPaused: false,
    isOwnerUsername: false,
    balance: -200,
    notes: "موقوف مؤقتاً — دين",
    createdAt: subDays(today, 60).toISOString(),
    updatedAt: subDays(today, 0).toISOString(),
  },
  {
    id: 6,
    lineId: "W08-133",
    username: "0599555666PP",
    password: "bld133pw",
    fullName: "إدارة مبنى 12",
    facilityType: "شركة",
    phone: "0599555666",
    packageLine: 8,
    speedMbps: 8,
    monthlyPrice: 160,
    startDate: isoDate(400),
    firstContactDate: isoDate(15),
    disconnectionDate: disconnectFromFirstContact(isoDate(15)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: 0,
    notes: "اشتراك مشترك للمبنى",
    createdAt: subDays(today, 400).toISOString(),
    updatedAt: subDays(today, 10).toISOString(),
  },
  {
    id: 7,
    lineId: "W16-221",
    username: "0599666777PP",
    password: "ran221",
    fullName: "رانيا قاسم",
    facilityType: "مؤسسة تعليمية",
    phone: "0599666777",
    packageLine: 16,
    speedMbps: 16,
    monthlyPrice: 250,
    startDate: isoDate(45),
    firstContactDate: isoDate(35),
    disconnectionDate: disconnectFromFirstContact(isoDate(35)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: 50,
    notes: null,
    createdAt: subDays(today, 45).toISOString(),
    updatedAt: subDays(today, 4).toISOString(),
  },
  {
    id: 8,
    lineId: "W04-056",
    username: "0599777888PP",
    password: "tariq88",
    fullName: "طارق أبو علي",
    facilityType: "منزل",
    phone: "0599777888",
    packageLine: 4,
    speedMbps: 4,
    monthlyPrice: 120,
    startDate: isoDate(30),
    firstContactDate: isoDate(29),
    disconnectionDate: disconnectFromFirstContact(isoDate(29)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: 0,
    notes: "ينتهي خلال يوم",
    createdAt: subDays(today, 30).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
  },
  {
    id: 9,
    lineId: "W08-190",
    username: "0599888999PP",
    password: "hiba99",
    fullName: "هبة ناصر",
    facilityType: "محل تجاري",
    phone: "0599888999",
    packageLine: 8,
    speedMbps: 8,
    monthlyPrice: 160,
    startDate: isoDate(150),
    firstContactDate: isoDate(28),
    disconnectionDate: disconnectFromFirstContact(isoDate(28)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: -30,
    notes: "ينتهي خلال يومين",
    createdAt: subDays(today, 150).toISOString(),
    updatedAt: subDays(today, 7).toISOString(),
  },
  {
    id: 10,
    lineId: "W16-077",
    username: "0599999000PP",
    password: "khaled77",
    fullName: "خالد عمري",
    facilityType: "منزل",
    phone: "0599999000",
    packageLine: 16,
    speedMbps: 16,
    monthlyPrice: 250,
    startDate: isoDate(80),
    firstContactDate: isoDate(25),
    disconnectionDate: disconnectFromFirstContact(isoDate(25)),
    isActive: true,
    isSuspended: false,
    isPaused: false,
    isOwnerUsername: false,
    balance: 0,
    notes: "ينتهي خلال أسبوع — قريباً",
    createdAt: subDays(today, 80).toISOString(),
    updatedAt: subDays(today, 6).toISOString(),
  },
];

export const mockUsernameHistory: UsernameHistoryEntry[] = [
  {
    id: 1,
    subscriberLineId: "W04-101",
    oldUsername: "0599000111PP",
    oldPassword: "old101",
    usageStartDate: isoDate(90),
    usageEndDate: isoDate(10),
    changedAt: subDays(today, 10).toISOString(),
  },
  {
    id: 2,
    subscriberLineId: "W16-042",
    oldUsername: "0599111000PP",
    oldPassword: "prev042",
    usageStartDate: isoDate(250),
    usageEndDate: isoDate(200),
    changedAt: subDays(today, 200).toISOString(),
  },
];

export const mockSpeedHistory: SpeedHistoryEntry[] = [
  {
    id: 1,
    subscriberLineId: "W08-205",
    oldSpeedMbps: 4,
    newSpeedMbps: 8,
    usageStartDate: isoDate(90),
    usageEndDate: isoDate(30),
    daysUsed: 60,
    changedAt: subDays(today, 30).toISOString(),
  },
  {
    id: 2,
    subscriberLineId: "W16-077",
    oldSpeedMbps: 8,
    newSpeedMbps: 16,
    usageStartDate: isoDate(80),
    usageEndDate: isoDate(40),
    daysUsed: 40,
    changedAt: subDays(today, 40).toISOString(),
  },
];

export const mockSubscriberInvoices: SubscriberInvoice[] = [
  {
    id: 1,
    subscriberLineId: "W04-101",
    amount: 120,
    paidAmount: 50,
    status: "partial",
    paymentMethod: "cash",
    notes: "دفعة جزئية — شهر 1",
    createdAt: subDays(today, 25).toISOString(),
    paidAt: subDays(today, 25).toISOString(),
  },
  {
    id: 2,
    subscriberLineId: "W04-101",
    amount: 40,
    paidAmount: 110,
    status: "paid",
    paymentMethod: "transfer",
    notes: "تسوية رصيد",
    createdAt: subDays(today, 20).toISOString(),
    paidAt: subDays(today, 20).toISOString(),
  },
  {
    id: 3,
    subscriberLineId: "W04-101",
    amount: 50,
    paidAmount: 25,
    status: "partial",
    paymentMethod: "cash",
    notes: "دفعة جزئية",
    createdAt: subDays(today, 15).toISOString(),
    paidAt: subDays(today, 15).toISOString(),
  },
  {
    id: 4,
    subscriberLineId: "W04-101",
    amount: 40,
    paidAmount: 80,
    status: "paid",
    paymentMethod: "cash",
    notes: "دفعة + فائض",
    createdAt: subDays(today, 10).toISOString(),
    paidAt: subDays(today, 10).toISOString(),
  },
  {
    id: 5,
    subscriberLineId: "W04-101",
    amount: 0,
    paidAmount: 15,
    status: "paid",
    paymentMethod: "cash",
    notes: "دفعة مقدّمة",
    createdAt: subDays(today, 5).toISOString(),
    paidAt: subDays(today, 5).toISOString(),
  },
  {
    id: 6,
    subscriberLineId: "W04-101",
    amount: 30,
    paidAmount: 0,
    status: "debt",
    paymentMethod: null,
    notes: "رسوم شهرية",
    createdAt: subDays(today, 2).toISOString(),
    paidAt: null,
  },
  {
    id: 7,
    subscriberLineId: "W08-205",
    amount: 160,
    paidAmount: 160,
    status: "paid",
    paymentMethod: "transfer",
    notes: "اشتراك شهري",
    createdAt: subDays(today, 30).toISOString(),
    paidAt: subDays(today, 29).toISOString(),
  },
  {
    id: 8,
    subscriberLineId: "W32-017",
    amount: 160,
    paidAmount: 0,
    status: "debt",
    paymentMethod: null,
    notes: "متأخر",
    createdAt: subDays(today, 45).toISOString(),
    paidAt: null,
  },
];

export function getSubscriberByLineId(lineId: string): Subscriber | undefined {
  return mockSubscribers.find((s) => s.lineId === lineId);
}

export function getActiveSubscriberByLineId(lineId: string): Subscriber | undefined {
  const row = getSubscriberByLineId(lineId);
  return row && !row.isSuspended ? row : undefined;
}

/** Customer registry — includes stopped (may still owe balance) */
export function getCustomerByLineId(lineId: string): Subscriber | undefined {
  return getSubscriberByLineId(lineId);
}

export function getStoppedSubscribers(): Subscriber[] {
  return mockSubscribers.filter((s) => s.isSuspended);
}

export function getUsernameHistoryForSubscriber(lineId: string): UsernameHistoryEntry[] {
  return mockUsernameHistory.filter((h) => h.subscriberLineId === lineId);
}

export function getSpeedHistoryForSubscriber(lineId: string): SpeedHistoryEntry[] {
  return mockSpeedHistory.filter((h) => h.subscriberLineId === lineId);
}

export function getInvoicesForSubscriber(lineId: string): SubscriberInvoice[] {
  return mockSubscriberInvoices.filter((i) => i.subscriberLineId === lineId);
}

export { getDistinctSpeeds } from "@/lib/subscriberUtils";
