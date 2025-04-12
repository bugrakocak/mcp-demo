import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const API_URL = "http://localhost:3000";

// Create an MCP server
const server = new McpServer({
  name: "Notepad",
  version: "1.0.0",
});

// Tool to list all notes (replacing resource)
server.tool("notes-list", {}, async () => {
  try {
    const response = await fetch(`${API_URL}/notes`);
    const notes = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(notes, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error fetching notes: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Tool to get a specific note by ID (replacing resource)
server.tool(
  "note-by-id",
  {
    id: z.string().min(1, "Note ID is required"),
  },
  async ({ id }) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}`);

      if (!response.ok) {
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

      const note = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(note, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error fetching note: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool to add a new note
server.tool(
  "add-note",
  {
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
  },
  async ({ title, content }) => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        return {
          content: [
            {
              type: "text",
              text: `Error adding note: ${errorData.error || "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }

      const newNote = await response.json();

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error adding note: ${errorMessage}`,
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
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        return {
          content: [
            {
              type: "text",
              text: `Error updating note: ${
                errorData.error || "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }

      const updatedNote = await response.json();

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error updating note: ${errorMessage}`,
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
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        return {
          content: [
            {
              type: "text",
              text: `Error deleting note: ${
                errorData.error || "Unknown error"
              }`,
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error deleting note: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
