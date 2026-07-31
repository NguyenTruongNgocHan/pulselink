import type { Person } from "../domain/models";

export const people: Person[] = [
  {
    id: "emma-wilson",
    displayName: "Emma Wilson",
    username: "@emmawilson",
    initials: "EW",
    avatarTone: "violet",
    presence: "online",
  },
  {
    id: "michael-torres",
    displayName: "Michael Torres",
    username: "@michaeltorres",
    initials: "MT",
    avatarTone: "blue",
    presence: "online",
  },
  {
    id: "mia-nguyen",
    displayName: "Mia Nguyen",
    username: "@mianguyen",
    initials: "MN",
    avatarTone: "green",
    presence: "offline",
  },
  {
    id: "jordan-lee",
    displayName: "Jordan Lee",
    username: "@jordanlee",
    initials: "JL",
    avatarTone: "orange",
    presence: "offline",
  },
  {
    id: "alex-johnson",
    displayName: "Alex Johnson",
    username: "@alexjohnson",
    initials: "AJ",
    avatarTone: "gray",
    presence: "offline",
  },
];

export const friendRequests: Person[] = [
  people[3],
  people[4],
  people[1],
  people[2],
];
