import TaskInput from "../components/shared/TaskInput";
import TaskList from "../components/shared/TaskList";
import { useTasks } from "../hooks/task.hooks";

function App() {
  const { tasks, addTask, removeTask, toggleTask } = useTasks();

  return (
    <div>
      <h1>Tasks</h1>
      <TaskInput onAdd={addTask} />
      <TaskList tasks={tasks} onDelete={removeTask} onToggle={toggleTask} />
    </div>
  );
}

export default App;
