import {
  FiHome,
  FiUser,
  FiLogOut,
  FiLayers,
  FiCheckSquare,
  FiMessageSquare,
  FiCalendar,
} from "react-icons/fi"
import type { IconType } from "react-icons"

export type SidebarSubItem = {
  id: string
  label: string
  href: string
}

export type SidebarItem = {
  id: string
  label: string
  icon: IconType
  href?: string
  children?: SidebarSubItem[]
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiHome,
    href: "/admin",
  },
  {
    id: "projects",
    label: "Projects",
    icon: FiLayers,
    href: "/admin/projects",
  },
  // {
  //   id: "messages",
  //   label: "Chat",
  //   icon: FiMessageSquare,
  //   href: "/admin/messages",
  // },
  {
    id: "services",
    label: "Services",
    icon: FiLayers,
    href: "/admin/services"
  },
  {
    id: "stages",
    label: "Project Stages",
    icon: FiLayers,
    href: "/admin/ProjectStages"
  },
  {
    id: "clients",
    label: "Clients",
    icon: FiCheckSquare,
    href: "/admin/clients",
  },
  {
    id: "team",
    label: "Team",
    icon: FiUser,
    href: "/admin/team",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: FiCalendar,
    href: "/admin/calendar",
  },
  {
    id: "logout",
    label: "Logout",
    icon: FiLogOut,
  },
]
