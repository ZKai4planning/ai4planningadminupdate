import {
  FiHome,
  FiUser,
  FiLogOut,
  FiLayers,
  FiCheckSquare,
  FiDollarSign,
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
  
    id: "team",
    label: "Team",
    icon: FiUser,
    href: "/admin/team",
  },
{
    id: "clients",
    label: "Clients",
    icon: FiCheckSquare,
    href: "/admin/clients",
},
{
    id: "projects",
    label: "Projects",
    icon: FiLayers,   
    href: "/admin/projects",
},
// {
//     id: "revenue-overall",
//     label: "Revenue Overall",
//     icon: FiDollarSign,   
//     href: "/admin/revenue",
// },
// {
//     id: "revenue-project",
//     label: "Revenue Project",
//     icon: FiDollarSign,   
//     href: "/admin/payments",
// },

 
  {
    id: "logout",
    label: "Logout",
    icon: FiLogOut,
  },
]
 
 
