import { createRandom, FAKE_NOW, fakePeople } from "../lib/fake";

export const userRoles = ["Owner", "Admin", "Editor", "Member", "Viewer"] as const;
export type UserRole = (typeof userRoles)[number];
export type UserStatus = "active" | "invited" | "suspended";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  company?: string;
  joinedAt?: string;
  lastActiveAt?: string;
  location?: string;
  title?: string;
}

const CITIES = ["Lagos", "Baltimore", "Lisbon", "Tokyo", "Berlin", "Toronto", "Seoul", "Nairobi", "Austin", "Paris"];
const TITLES = [
  "Product designer",
  "Staff engineer",
  "Engineering manager",
  "Data analyst",
  "Founder",
  "Support lead",
  "Marketing lead",
];

export function fakeUsers(count = 24, seed = 5): AppUser[] {
  const r = createRandom(seed + 100);
  return fakePeople(count, seed).map((p, i) => ({
    ...p,
    // The first person is the owner, matching the signed-in user in the sidebar's fake data.
    ...(i === 0 ? { name: "Ada Lovelace", email: "ada@northwind.com", company: "Northwind" } : {}),
    status: i === 0 ? "active" : i % 9 === 4 ? "invited" : i % 11 === 7 ? "suspended" : "active",
    location: r.pick(CITIES),
    title: r.pick(TITLES),
    lastActiveAt: i % 9 === 4 ? undefined : p.lastActiveAt,
  }));
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export function fakeSessions(): Session[] {
  return [
    {
      id: "s1",
      device: "Chrome on macOS",
      location: "Baltimore, US",
      lastActiveAt: new Date(FAKE_NOW - 60_000).toISOString(),
      isCurrent: true,
    },
    {
      id: "s2",
      device: "Safari on iPhone",
      location: "Baltimore, US",
      lastActiveAt: new Date(FAKE_NOW - 5 * 3_600_000).toISOString(),
    },
    {
      id: "s3",
      device: "Firefox on Windows",
      location: "Lagos, NG",
      lastActiveAt: new Date(FAKE_NOW - 6 * 86_400_000).toISOString(),
    },
  ];
}
