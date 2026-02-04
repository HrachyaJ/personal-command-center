import TaskInput from "../TaskInput";
import TaskList from "../TaskList";
import { Button } from "../../ui/button";
import { useTasks } from "../../../hooks/task.hooks";

const TaskContainer = () => {
  const {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    clearCompleted,
    countCompleted,
    editTask,
  } = useTasks();

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto mt-20">
      <h1 className="text-center text-2xl font-semibold">Tasks</h1>
      <TaskInput onAdd={addTask} />
      <TaskList
        tasks={tasks}
        onDelete={removeTask}
        onToggle={toggleTask}
        onClearCompleted={clearCompleted}
        onCountCompleted={countCompleted}
        onEdit={editTask}
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
};

export default TaskContainer;
