/**
 * Everything on the site, in one place. Sponsors, judges and mentors are invented for this example.
 */

/** Opening ceremony, Eastern time. */
export const EVENT_START = new Date("2027-04-09T18:00:00-04:00");

export const nav = [
  { label: "About", href: "#about" },
  { label: "Tracks", href: "#tracks" },
  { label: "Schedule", href: "#schedule" },
  { label: "Prizes", href: "#prizes" },
  { label: "FAQ", href: "#faq" },
];

export const stats = [
  { value: 500, suffix: "+", label: "Hackers expected" },
  { value: 36, label: "Hours of building" },
  { value: 25, prefix: "$", suffix: "K", label: "In prizes" },
  { value: 40, suffix: "+", label: "Schools represented" },
];

export const sponsors = [
  "Cobalt Cloud",
  "Brightline",
  "Harbor AI",
  "Quanta Bank",
  "Fieldstone",
  "Parallel Labs",
  "Northwind",
  "Lumen Health",
  "Atlas Robotics",
  "Keystone Energy",
];

export type TrackId = "ai" | "fintech" | "health" | "civic" | "climate" | "beginner";

export const tracks: { id: TrackId; name: string; description: string; prize: string; sponsor: string }[] = [
  { id: "ai", name: "AI for good", description: "Use models responsibly to solve a real problem for a real community.", prize: "$3,000", sponsor: "Harbor AI" },
  { id: "fintech", name: "Fintech", description: "Help people save, budget, invest or send money with less friction.", prize: "$3,000", sponsor: "Quanta Bank" },
  { id: "health", name: "Health and wellness", description: "Tools for patients, caregivers and anyone trying to feel better.", prize: "$2,500", sponsor: "Lumen Health" },
  { id: "civic", name: "Civic tech", description: "Make Baltimore easier to live in: transit, housing, voting, schools.", prize: "$2,500", sponsor: "Northwind" },
  { id: "climate", name: "Climate and energy", description: "Measure, reduce or adapt. Bonus points for using open data.", prize: "$2,500", sponsor: "Keystone Energy" },
  { id: "beginner", name: "First hack", description: "Never built at a hackathon? Ship anything. Mentors will pair with you.", prize: "$1,500", sponsor: "Brightline" },
];

export const prizes = [
  { place: "Grand prize", amount: 5000, perks: ["Interviews with 4 sponsor teams", "Trophy and a spot on the wall", "Demo at the closing ceremony"] },
  { place: "Runner up", amount: 2500, perks: ["Mentorship sessions", "Swag pack for the team"] },
  { place: "Best design", amount: 1000, perks: ["Design tool licenses", "Portfolio review"] },
  { place: "Best hardware hack", amount: 1000, perks: ["Dev kits to keep", "Lab time in the Makerspace"] },
];

export type ScheduleKind = "Ceremony" | "Workshop" | "Food" | "Hacking" | "Fun";

export const schedule: { day: string; date: string; items: { time: string; title: string; place: string; kind: ScheduleKind }[] }[] = [
  {
    day: "Friday",
    date: "April 9",
    items: [
      { time: "4:00 PM", title: "Check-in opens", place: "Student Center lobby", kind: "Ceremony" },
      { time: "5:30 PM", title: "Dinner", place: "Ballroom", kind: "Food" },
      { time: "6:00 PM", title: "Opening ceremony", place: "Murphy Auditorium", kind: "Ceremony" },
      { time: "7:00 PM", title: "Team formation mixer", place: "Ballroom", kind: "Fun" },
      { time: "8:00 PM", title: "Hacking begins", place: "Everywhere", kind: "Hacking" },
      { time: "9:00 PM", title: "Intro to Git and GitHub", place: "Room 214", kind: "Workshop" },
    ],
  },
  {
    day: "Saturday",
    date: "April 10",
    items: [
      { time: "8:00 AM", title: "Breakfast", place: "Ballroom", kind: "Food" },
      { time: "10:00 AM", title: "Build your first API", place: "Room 214", kind: "Workshop" },
      { time: "12:00 PM", title: "Lunch", place: "Ballroom", kind: "Food" },
      { time: "2:00 PM", title: "Designing for real users", place: "Room 118", kind: "Workshop" },
      { time: "4:00 PM", title: "Prompting and evals for LLM apps", place: "Room 214", kind: "Workshop" },
      { time: "7:00 PM", title: "Dinner and cup stacking", place: "Ballroom", kind: "Fun" },
      { time: "11:59 PM", title: "Midnight snack run", place: "Lobby", kind: "Food" },
    ],
  },
  {
    day: "Sunday",
    date: "April 11",
    items: [
      { time: "8:00 AM", title: "Hacking ends, submit on Devpost", place: "Online", kind: "Hacking" },
      { time: "8:30 AM", title: "Breakfast", place: "Ballroom", kind: "Food" },
      { time: "9:30 AM", title: "Science fair judging", place: "Gym", kind: "Ceremony" },
      { time: "12:00 PM", title: "Lunch", place: "Ballroom", kind: "Food" },
      { time: "1:00 PM", title: "Closing ceremony and awards", place: "Murphy Auditorium", kind: "Ceremony" },
    ],
  },
];

export const judges = [
  { name: "Amara Okafor", role: "Staff engineer", org: "Cobalt Cloud" },
  { name: "Daniel Reyes", role: "Product designer", org: "Brightline" },
  { name: "Priya Natarajan", role: "ML researcher", org: "Harbor AI" },
  { name: "Marcus Bell", role: "Founder", org: "Fieldstone" },
  { name: "Lena Fischer", role: "Engineering manager", org: "Quanta Bank" },
  { name: "Kwame Asante", role: "Robotics lead", org: "Atlas Robotics" },
  { name: "Sofia Moreno", role: "Data scientist", org: "Lumen Health" },
  { name: "Jordan Hayes", role: "CS faculty", org: "Host university" },
];

export const faq = [
  { question: "Who can come?", answer: "Any student 18 or older: undergrad, grad, bootcamp or self-taught. Every major is welcome. You don't need to know how to code; plenty of teams need designers and storytellers." },
  { question: "How much does it cost?", answer: "Nothing. Food, drinks, swag, Wi-Fi and a place to nap are all free. We offer travel stipends for students coming from more than 100 miles away." },
  { question: "Do I need a team?", answer: "No. Teams are 1 to 4 people, and the mixer on Friday night is built for finding one. You can also register as a team." },
  { question: "What should I bring?", answer: "A laptop, charger, ID, toiletries and a sleeping bag if you plan to stay overnight. We'll have a hardware lab with Arduinos, sensors and a 3D printer." },
  { question: "Can I start my project early?", answer: "You can brainstorm and learn ahead of time, but all code and design work must start after hacking begins on Friday at 8 PM." },
  { question: "Is there a code of conduct?", answer: "Yes. We want MorganHacks to be welcoming for everyone, and every participant, mentor, sponsor and judge agrees to it at registration." },
];

/** Where last year's hackers came from, for the globe. */
export const origins = [
  { label: "Baltimore", lat: 39.29, lng: -76.61, size: 2.2 },
  { label: "Washington, DC", lat: 38.9, lng: -77.04 },
  { label: "Philadelphia", lat: 39.95, lng: -75.17 },
  { label: "New York", lat: 40.71, lng: -74.0 },
  { label: "Atlanta", lat: 33.75, lng: -84.39 },
  { label: "Durham", lat: 35.99, lng: -78.9 },
  { label: "Nashville", lat: 36.16, lng: -86.78 },
  { label: "Houston", lat: 29.76, lng: -95.37 },
  { label: "Chicago", lat: 41.88, lng: -87.63 },
  { label: "Toronto", lat: 43.65, lng: -79.38 },
  { label: "San Francisco", lat: 37.77, lng: -122.42 },
  { label: "London", lat: 51.5, lng: -0.12 },
  { label: "Accra", lat: 5.6, lng: -0.19 },
  { label: "Lagos", lat: 6.52, lng: 3.38 },
];

export const levels = [
  "Undergraduate, 1st or 2nd year",
  "Undergraduate, 3rd year or later",
  "Graduate student",
  "Bootcamp or self-taught",
  "Recent graduate",
] as const;

export const footerColumns = [
  { title: "Event", links: [{ label: "Tracks", href: "#tracks" }, { label: "Schedule", href: "#schedule" }, { label: "Prizes", href: "#prizes" }, { label: "FAQ", href: "#faq" }] },
  { title: "Get involved", links: [{ label: "Register", href: "#/register" }, { label: "Mentor", href: "#faq" }, { label: "Volunteer", href: "#faq" }, { label: "Sponsor", href: "#sponsors" }] },
  { title: "Community", links: [{ label: "Code of conduct", href: "#faq" }, { label: "Past projects", href: "#prizes" }, { label: "Built with Junco", href: "https://junco.madebytobi.com" }] },
];
