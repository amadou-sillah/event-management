import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/protected-route";
import { MainLayout } from "./components/layout/main-layout";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import EventsList from "./pages/events-list";
import EventDetails from "./pages/event-details";
import CreateEvent from "./pages/create-event";
import Attendees from "./pages/attendees";
import Ticketing from "./pages/Ticketing";
import Library from "./pages/Library";
import Settings from "./pages/Settings"; // ✅ New import

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/edit" element={<CreateEvent />} />
          <Route path="/attendees" element={<Attendees />} />
          <Route path="/ticketings" element={<Ticketing />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} /> {/* ✅ New route */}
        </Route>
      </Route>
    </Routes>
  );
}