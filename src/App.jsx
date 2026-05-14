import Dashboard from "@/pages/Dashboard";
import { DashboardProvider } from "@/context/DashboardContext";

export default function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}
