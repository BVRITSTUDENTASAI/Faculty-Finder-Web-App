import { createBrowserRouter } from "react-router";
import StudentHome from "./components/StudentHome";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import FacultyDetail from "./components/FacultyDetail";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: StudentHome },
      { path: "login", Component: Login },
      { path: "dashboard", Component: Dashboard },
      { path: "faculty/:id", Component: FacultyDetail },
    ],
  },
]);
