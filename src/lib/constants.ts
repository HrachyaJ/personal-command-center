import { BarChart3, Brain, CheckSquare, Home, Target } from "lucide-react";
import type { Feature, Stat } from "../types/dashboard.types";
import { COLORS } from "./theme";

export const TESTIMONIALS = [
  {
    quote:
      "I've tried every productivity app. FocusFlow is the first one I actually stuck with.",
    name: "Sarah K.",
    role: "Product Designer",
  },
  {
    quote:
      "The habit tracking alone changed my mornings. The goal system changed my year.",
    name: "Marcus T.",
    role: "Software Engineer",
  },
  {
    quote:
      "Clean, fast, no distractions. Finally a tool that respects my time.",
    name: "Priya M.",
    role: "Founder",
  },
];

export const FEATURES: Feature[] = [
  {
    icon: "✓",
    title: "Task Management",
    description:
      "Capture, prioritize, and complete tasks with ruthless efficiency. No fluff, just results.",
    color: COLORS.green,
  },
  {
    icon: "◎",
    title: "Goal Tracking",
    description:
      "Set ambitious targets, track progress in real time, and hit milestones that actually matter.",
    color: COLORS.blue,
  },
  {
    icon: "⟳",
    title: "Habit Building",
    description:
      "Stack daily habits, watch your streaks grow, and build the compound effect over time.",
    color: COLORS.orange,
  },
  {
    icon: "↗",
    title: "Analytics",
    description:
      "Understand your patterns. See where your time goes and double down on what works.",
    color: COLORS.purple,
  },
];

export const STATS: Stat[] = [
  { value: "10k+", label: "Active users" },
  { value: "94%", label: "Retention rate" },
  { value: "3.2×", label: "Avg productivity lift" },
  { value: "4.9★", label: "User rating" },
];

export const example_tasks = [
  "Design system audit",
  "Write Q2 OKRs",
  "Review PRs",
  "Team sync",
];

export const example_habits = [
  { name: "Morning run", done: true, streak: 14 },
  { name: "Read 30 min", done: true, streak: 7 },
  { name: "Meditate", done: false, streak: 3 },
];

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: BarChart3 },
  { name: "AI Coach", href: "/ai-coach", icon: Brain },
];
