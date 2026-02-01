import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface TaskInputProps {
  onAdd: (task: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;

    onAdd(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="New task..."
        className="w-64 mr-1"
      />
      <Button variant="outline">Add</Button>
    </form>
  );
}
