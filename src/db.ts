import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to our JSON database file
const DB_PATH = path.join(__dirname, "..", "data", "notes.json");

// Define the Note type
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Initialize the database
export async function initDb(): Promise<void> {
  try {
    // Create the data directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, "..", "data"), { recursive: true });

    // Check if the database file exists
    try {
      await fs.access(DB_PATH);
    } catch (error) {
      // If the file doesn't exist, create it with an empty notes array
      await fs.writeFile(DB_PATH, JSON.stringify({ notes: [] }, null, 2));
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Read all notes from the database
export async function getAllNotes(): Promise<Note[]> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const { notes } = JSON.parse(data);
    return notes;
  } catch (error) {
    console.error("Error reading notes:", error);
    return [];
  }
}

// Get a note by ID
export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const notes = await getAllNotes();
    return notes.find((note) => note.id === id) || null;
  } catch (error) {
    console.error("Error getting note by ID:", error);
    return null;
  }
}

// Add a new note
export async function addNote(title: string, content: string): Promise<Note> {
  try {
    const notes = await getAllNotes();

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);

    await fs.writeFile(DB_PATH, JSON.stringify({ notes }, null, 2));

    return newNote;
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
}

// Update an existing note
export async function updateNote(
  id: string,
  title: string,
  content: string
): Promise<Note | null> {
  try {
    const notes = await getAllNotes();
    const noteIndex = notes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      return null;
    }

    const updatedNote: Note = {
      ...notes[noteIndex],
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    notes[noteIndex] = updatedNote;

    await fs.writeFile(DB_PATH, JSON.stringify({ notes }, null, 2));

    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const notes = await getAllNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);

    if (filteredNotes.length === notes.length) {
      return false; // Note not found
    }

    await fs.writeFile(
      DB_PATH,
      JSON.stringify({ notes: filteredNotes }, null, 2)
    );

    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    return false;
  }
}
