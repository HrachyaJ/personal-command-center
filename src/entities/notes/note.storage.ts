import type { Note } from "./note.types";
import { storage } from "../../shared/utils/storage";

const NOTES_KEY = "notes";

export const getNotes = (): Note[] => {
  const raw = storage.get(NOTES_KEY);
  return raw ? (JSON.parse(raw) as Note[]) : [];
};

export const saveNotes = (notes: Note[]): void => {
  storage.set(NOTES_KEY, JSON.stringify(notes));
};

export const clearNotes = (): void => {
  storage.remove(NOTES_KEY);
};
