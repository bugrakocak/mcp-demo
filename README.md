This demo implementation of the MCP was developed using the official MCP documentation and the Cursor

# MCP Notepad Server

A simple Model Context Protocol (MCP) server that provides notepad functionality for LLM applications.
This project created with the help of the official MCP documentation and the Cursor.

## Features

- Create, read, update, and delete notes
- Store notes in a local JSON file
- Expose notes through MCP resources and tools

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

Start the server:

```bash
npm start
```

The server will start and listen for MCP protocol messages on stdin/stdout.

## MCP Resources

- `notes://list` - Lists all notes
- `notes://id/{id}` - Gets a specific note by ID

## MCP Tools

- `add-note` - Creates a new note

  - Parameters:
    - `title` (string): The title of the note
    - `content` (string): The content of the note

- `update-note` - Updates an existing note

  - Parameters:
    - `id` (string): The ID of the note to update
    - `title` (string): The new title
    - `content` (string): The new content

- `delete-note` - Deletes a note
  - Parameters:
    - `id` (string): The ID of the note to delete

## Development

Run the server in development mode:

```bash
npm run dev
```

## License

ISC
