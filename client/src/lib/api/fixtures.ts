import type { Problem } from "./types";

export const PROBLEM_FIXTURES: Problem[] = [
  {
    id: "prob_parking_lot",
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
    expectedEntities: [
      "ParkingLot",
      "Level",
      "ParkingSpot",
      "Vehicle",
      "Ticket",
      "PricingStrategy",
    ],
  },
  {
    id: "prob_elevator",
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
      "Do not worry about real concurrency/threading — focus on the object model and state transitions.",
    ],
    expectedEntities: [
      "ElevatorController",
      "Elevator",
      "ElevatorState",
      "Request",
      "DispatchStrategy",
      "Floor",
    ],
  },
  {
    id: "prob_vending_machine",
    slug: "vending-machine",
    title: "Vending Machine",
    difficulty: "easy",
    tags: ["State pattern", "Inventory management"],
    summary:
      "Design a vending machine that accepts coins/notes, lets a user select a product, dispenses it, and returns change — modeling the machine's states explicitly.",
    requirements: [
      "Support inserting money in increments and tracking the running balance.",
      "Support selecting a product by code, validating stock and sufficient balance.",
      "Dispense the product and return correct change, or reject with a clear reason.",
      "Support restocking and price updates by an operator.",
      "Model machine states explicitly (idle, has money, dispensing, out of stock).",
    ],
    constraints: [
      "Change-making logic should be isolated so the denomination set can change later.",
      "Two people should not be able to buy the last unit of the same product from a race condition — note how your design would prevent this even if not implemented.",
    ],
    expectedEntities: [
      "VendingMachine",
      "Product",
      "Inventory",
      "MachineState",
      "CoinValidator",
    ],
  },
];
