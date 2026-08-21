import { Navigate, Routes, Route } from "react-router";
import { IncidentListPage } from "@/features/incidents/pages/IncidentListPage";
import { AppLayout } from "@/app/layouts/AppLayout";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/incidents" replace />} />
        <Route path="incidents" element={<IncidentListPage />} />
      </Route>
    </Routes>
  );
}

export default App;
