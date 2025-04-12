import express from "express";
import * as db from "./db.js";

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize the database
await db.initDb();

// List all notes
app.get("/notes", async (req, res) => {
  console.log("get all notes");
  const notes = await db.getAllNotes();
  res.json(notes);
});

// Get a note by ID
app.get("/notes/:id", async (req, res) => {
  console.log("get note by id", req.params.id);
  const note = await db.getNoteById(req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});

// Add a new note
app.post("/notes", async (req, res) => {
  console.log("add note", req.body);
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const newNote = await db.addNote(title, content);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Update a note
app.put("/notes/:id", async (req, res) => {
  console.log("update note", req.params.id, req.body);
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const updatedNote = await db.updateNote(req.params.id, title, content);
    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete a note
app.delete("/notes/:id", async (req, res) => {
  console.log("delete note", req.params.id);
  try {
    const success = await db.deleteNote(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Notepad API server running at http://localhost:${PORT}`);
});
