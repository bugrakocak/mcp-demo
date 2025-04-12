import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as db from "./db.js";

// Initialize the database
await db.initDb();

// Create an MCP server
const server = new McpServer({
  name: "Notepad",
  version: "1.0.0",
});

// Resource to list all notes
server.resource("notes-list", "notes://list", async (uri) => {
  const notes = await db.getAllNotes();
  return {
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(notes, null, 2),
      },
    ],
  };
});

// Resource to get a specific note by ID
server.resource("note-by-id", "notes://id/{id}", async (uri) => {
  // Extract the ID from the URI
  const id = uri.pathname.split("/").pop() || "";

  const note = await db.getNoteById(id);

  if (!note) {
    return {
      contents: [
        {
          uri: uri.href,
          text: `Note with ID ${id} not found.`,
        },
      ],
      isError: true,
    };
  }

  return {
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(note, null, 2),
      },
    ],
  };
});

// Tool to add a new note
server.tool(
  "add-note",
  {
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
  },
  async ({ title, content }) => {
    try {
      const newNote = await db.addNote(title, content);
      return {
        content: [
          {
            type: "text",
            text: `Note added successfully: ${JSON.stringify(
              newNote,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error adding note: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool to update an existing note
server.tool(
  "update-note",
  {
    id: z.string().min(1, "Note ID is required"),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
  },
  async ({ id, title, content }) => {
    try {
      const updatedNote = await db.updateNote(id, title, content);

      if (!updatedNote) {
        return {
          content: [
            {
              type: "text",
              text: `Note with ID ${id} not found.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Note updated successfully: ${JSON.stringify(
              updatedNote,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error updating note: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool to delete a note
server.tool(
  "delete-note",
  {
    id: z.string().min(1, "Note ID is required"),
  },
  async ({ id }) => {
    try {
      const success = await db.deleteNote(id);

      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: `Note with ID ${id} not found.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Note with ID ${id} deleted successfully.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error deleting note: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
console.log("Starting Notepad MCP server...");
await server.connect(transport);
console.log("Notepad MCP server connected and ready to use!");
