import type { ComponentType } from "react";
import {
  IconCheck,
  IconChefHat,
  IconClock,
  IconHeart,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSparkles,
  IconStar,
  IconUsers,
  type IconProps,
} from "@tabler/icons-react";

const BUILDER_ICON_SET = {
  star: IconStar,
  heart: IconHeart,
  phone: IconPhone,
  mail: IconMail,
  mapPin: IconMapPin,
  clock: IconClock,
  chefHat: IconChefHat,
  check: IconCheck,
  sparkles: IconSparkles,
  users: IconUsers,
} as const;

type BuilderIconName = keyof typeof BUILDER_ICON_SET;

export const BUILDER_ICON_OPTIONS = [
  { value: "star", label: "Star" },
  { value: "heart", label: "Heart" },
  { value: "phone", label: "Phone" },
  { value: "mail", label: "Mail" },
  { value: "mapPin", label: "Map pin" },
  { value: "clock", label: "Clock" },
  { value: "chefHat", label: "Dining" },
  { value: "check", label: "Check" },
  { value: "sparkles", label: "Sparkles" },
  { value: "users", label: "People" },
] as const;

export const getBuilderIcon = (
  name?: string,
): ComponentType<IconProps> =>
  BUILDER_ICON_SET[(name as BuilderIconName) ?? "star"] ?? IconStar;
