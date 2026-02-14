import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import Dashboard from "../components/shared/containers/Dashboard";
import Goals from "../components/shared/containers/Goals";
import Tasks from "../components/shared/containers/Tasks";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background">
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/pomodoro" element={<Tasks />} />
            <Route path="/analytics" element={<Tasks />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/focus-mode" element={<Tasks />} />
            <Route path="/ai-coach" element={<Tasks />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
