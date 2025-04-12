import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "..", "dist", "index.js");

// Spawn the server process
const serverProcess = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
});

// Handle server output
serverProcess.stdout.on("data", (data) => {
  console.log(`Server output: ${data}`);
});

serverProcess.stderr.on("data", (data) => {
  console.error(`Server error: ${data}`);
});

// Test adding a note
const addNoteRequest = {
  jsonrpc: "2.0",
  id: "1",
  method: "tools/call",
  params: {
    name: "add-note",
    arguments: {
      title: "Test Note",
      content: "This is a test note created by the test client.",
    },
  },
};

// Wait for server to start
setTimeout(() => {
  console.log("Sending add-note request...");
  serverProcess.stdin.write(JSON.stringify(addNoteRequest) + "\n");

  // Wait for response and then test listing notes
  setTimeout(() => {
    const listNotesRequest = {
      jsonrpc: "2.0",
      id: "2",
      method: "resources/read",
      params: {
        uri: "notes://list",
      },
    };

    console.log("Sending list-notes request...");
    serverProcess.stdin.write(JSON.stringify(listNotesRequest) + "\n");

    // Wait for response and then terminate
    setTimeout(() => {
      console.log("Test completed, terminating server...");
      serverProcess.kill();
      process.exit(0);
    }, 1000);
  }, 1000);
}, 1000);

// Handle process termination
process.on("SIGINT", () => {
  console.log("Terminating server...");
  serverProcess.kill();
  process.exit(0);
});
