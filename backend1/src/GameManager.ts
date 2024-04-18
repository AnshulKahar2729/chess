import WebSocket from "ws";
import { INIT_GAME } from "./messages";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private users: WebSocket[];
  private pendingUser: WebSocket | null;
  constructor() {
    this.games = [];
    this.users = [];
    this.pendingUser = null;
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      console.log(`Received message => ${data}`);
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        // if there is any pendingUser
        if (this.pendingUser) {
          // start the game with the pendingUser
          const game = new Game(socket, this.pendingUser);
          this.games.push(game);
          // remove the pendingUser
          this.pendingUser = null;
        } else {
          // set the user as pendingUser
          this.pendingUser = socket;
        }
      }

      if (message.type === "MOVE") {
        const game = this.games.find(
          (game) => game.player1 === socket || game.player2 === socket
        );
        if (game) {
          game.makeMove(socket, message.payload);
        }
      }
    });
  }
}
