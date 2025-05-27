import { HomeIcon, OrbitIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import Meditation from "./pages/Meditation.jsx";

export const navItems = [
  {
    title: "首页",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "冥想",
    to: "/meditation",
    icon: <OrbitIcon className="h-4 w-4" />,
    page: <Meditation />,
  },
];