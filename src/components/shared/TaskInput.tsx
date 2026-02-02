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
    <form onSubmit={handleSubmit} className="flex items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="New task..."
        className="mr-1"
      />
      <Button variant="default" className="cursor-pointer">
        Add
      </Button>
    </form>
  );
}
