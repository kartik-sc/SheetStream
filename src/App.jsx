import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "@/context/DashboardContext";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Users from "@/pages/Users";
import Uploads from "@/pages/Uploads";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users"     element={<Users />} />
            <Route path="uploads"   element={<Uploads />} />
            <Route path="settings"  element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}
