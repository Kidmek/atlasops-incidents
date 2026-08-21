import { Navigate, Routes, Route } from "react-router";
import { IncidentListPage } from "@/features/incidents/pages/IncidentListPage";
import { AppLayout } from "@/app/layouts/AppLayout";
import { IncidentDetailPage } from "@/features/incidents/pages/IncidentDetailPage";
import { IncidentCreatePage } from "@/features/incidents/pages/IncidentCreatePage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/incidents" replace />} />
        <Route path="incidents" element={<IncidentListPage />} />
        <Route path="incidents/new" element={<IncidentCreatePage />} />
        <Route path="incidents/:incidentId" element={<IncidentDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
