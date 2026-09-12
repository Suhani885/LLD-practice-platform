import type { Difficulty } from "../models/Problem";

export interface ProblemSeed {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  requirements: string[];
  constraints: string[];
  expectedEntities: string[];
}

export const PROBLEM_SEEDS: ProblemSeed[] = [
  {
    slug: "parking-lot",
    title: "Parking Lot System",
    difficulty: "medium",
    tags: ["OOP fundamentals", "Strategy pattern", "Factory pattern"],
    summary:
      "Design a multi-level parking lot that supports different vehicle types, assigns the nearest available spot, and computes a fee on exit.",
    requirements: [
      "Support multiple vehicle types (motorcycle, car, bus) with different spot-size needs.",
      "Each level has a fixed number of spots of different sizes.",
      "On entry, assign the nearest available compatible spot and issue a ticket.",
      "On exit, compute the parking fee based on duration and vehicle type.",
      "Support querying how many spots of each size are free, per level.",
    ],
    constraints: [
      "The lot has a fixed number of levels, set at construction time.",
      "Pricing strategy should be swappable (e.g. flat rate vs. hourly) without changing core allocation logic.",
    ],
    expectedEntities: ["ParkingLot", "Level", "ParkingSpot", "Vehicle", "Ticket", "PricingStrategy"],
  },
  {
    slug: "elevator-system",
    title: "Elevator System",
    difficulty: "hard",
    tags: ["State pattern", "Scheduling", "Concurrency-aware design"],
    summary:
      "Design the control system for a bank of elevators in a building, handling internal and external requests and deciding which elevator serves each request.",
    requirements: [
      "Support multiple elevators serving the same set of floors.",
      "Handle external hall calls (up/down from a floor) and internal cabin requests.",
      "Decide which elevator should service a new request (dispatch strategy).",
      "Model elevator state (idle, moving up, moving down, doors open) explicitly.",
      "Support querying the current floor and direction of every elevator.",
    ],
    constraints: [
      "Dispatch strategy should be swappable (e.g. nearest-car vs. zoned) without rewriting elevator state handling.",
      "Do not worry about real concurrency/threading - focus on the object model and state transitions.",
    ],
    expectedEntities: ["ElevatorController", "Elevator", "ElevatorState", "Request", "DispatchStrategy", "Floor"],
  },
  {
    slug: "vending-machine",
    title: "Vending Machine",
    difficulty: "easy",
    tags: ["State pattern", "Inventory management"],
    summary:
      "Design a vending machine that accepts coins/notes, lets a user select a product, dispenses it, and returns change - modeling the machine's states explicitly.",
    requirements: [
      "Support inserting money in increments and tracking the running balance.",
      "Support selecting a product by code, validating stock and sufficient balance.",
      "Dispense the product and return correct change, or reject with a clear reason.",
      "Support restocking and price updates by an operator.",
      "Model machine states explicitly (idle, has money, dispensing, out of stock).",
    ],
    constraints: [
      "Change-making logic should be isolated so the denomination set can change later.",
      "Two people should not be able to buy the last unit of the same product from a race condition - note how your design would prevent this even if not implemented.",
    ],
    expectedEntities: ["VendingMachine", "Product", "Inventory", "MachineState", "CoinValidator"],
  },
  {
    slug: "library-management",
    title: "Library Management System",
    difficulty: "easy",
    tags: ["OOP fundamentals", "Observer pattern"],
    summary:
      "Design a library system that tracks a catalog of books, lets members borrow and return copies, and notifies members when a reserved book becomes available.",
    requirements: [
      "Support searching the catalog by title, author, or ISBN.",
      "A book title can have multiple physical copies; track each copy's availability separately.",
      "Let a member borrow an available copy and return it, tracking due dates.",
      "Let a member reserve a title that's fully checked out, and get notified when a copy is returned.",
      "Support a simple late-fee calculation based on days overdue.",
    ],
    constraints: [
      "A member should not be able to borrow more than a fixed number of books at once.",
      "The notification mechanism should be swappable (email today, push notification later) without changing reservation logic.",
    ],
    expectedEntities: ["Library", "Book", "BookCopy", "Member", "Loan", "ReservationNotifier"],
  },
  {
    slug: "movie-ticket-booking",
    title: "Movie Ticket Booking System",
    difficulty: "hard",
    tags: ["State pattern", "Strategy pattern", "Concurrency-aware design"],
    summary:
      "Design a movie ticket booking system where a user picks a show, selects seats, and pays - making sure two people can't book the same seat.",
    requirements: [
      "A theater has multiple screens; each screen runs a schedule of shows for different movies.",
      "A show has a seat map; seats can be available, locked (mid-checkout), or booked.",
      "Support holding selected seats temporarily while a user checks out, then releasing the hold if payment isn't completed in time.",
      "Support multiple payment methods (card, wallet) without the booking flow knowing which one was used.",
      "Support cancelling a booking and releasing its seats.",
    ],
    constraints: [
      "Two users must never be able to successfully book the same seat for the same show - note how your design would prevent this even if not implemented.",
      "Payment strategy should be swappable without changing booking/seat-locking logic.",
    ],
    expectedEntities: ["Theater", "Screen", "Show", "Seat", "Booking", "PaymentStrategy"],
  },
  {
    slug: "expense-splitter",
    title: "Expense Splitter (Splitwise-style)",
    difficulty: "medium",
    tags: ["Strategy pattern", "Graph/balance modeling"],
    summary:
      "Design a system where a group of friends log shared expenses and the app tracks who owes whom, supporting equal, percentage, and exact splits.",
    requirements: [
      "Support creating a group of users and adding an expense paid by one user, split among a subset of the group.",
      "Support at least three split strategies: equal, exact amounts, and percentage.",
      "Track and query the net balance between any two users at any time.",
      "Support a user settling up (recording a payment) which updates balances.",
      "Support listing all expenses for a group, most recent first.",
    ],
    constraints: [
      "Split strategy should be swappable per-expense without changing how balances are stored or queried.",
      "Balances should stay consistent even as new expenses and settlements are added - note how your design keeps this correct.",
    ],
    expectedEntities: ["Group", "User", "Expense", "SplitStrategy", "Balance", "Settlement"],
  },
];
