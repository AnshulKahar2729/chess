import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on("connection", (ws) => {
  gameManager.addUser(ws);
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
  });
  ws.send("Hello, I am a WebSocket server");

  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});
