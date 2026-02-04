import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import TaskContainer from "../components/shared/containers/TaskContainer";
import Dashboard from "../components/shared/containers/Dashboard";
import Goals from "../components/shared/containers/Goals";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background">
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskContainer />} />
            <Route path="/pomodoro" element={<TaskContainer />} />
            <Route path="/analytics" element={<TaskContainer />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/focus-mode" element={<TaskContainer />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
