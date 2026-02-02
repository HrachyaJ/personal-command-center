import TaskInput from "../components/shared/TaskInput";
import TaskList from "../components/shared/TaskList";
import { Button } from "../components/ui/button";
import { useTasks } from "../hooks/task.hooks";

function App() {
  const {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    clearCompleted,
    countCompleted,
  } = useTasks();

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-center text-2xl font-bold">Tasks</h1>
      <TaskInput onAdd={addTask} />
      <TaskList
        tasks={tasks}
        onDelete={removeTask}
        onToggle={toggleTask}
        onClearCompleted={clearCompleted}
        onCountCompleted={countCompleted}
      />
      {tasks.length > 0 && (
        <Button
          onClick={clearCompleted}
          className="cursor-pointer float-right"
          variant="destructive"
        >
          Clear Completed ({countCompleted()})
        </Button>
      )}
    </div>
  );
}

export default App;
