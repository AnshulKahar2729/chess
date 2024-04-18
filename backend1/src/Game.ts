import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, MOVE } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.startTime = new Date();
    this.board = new Chess();

    const color = Math.random() > 0.5 ? "white" : "black";
    this.player1.send(
      JSON.stringify({
        type: "INIT_GAME",
        payload: { color: color },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: "INIT_GAME",
        payload: { color: color === "white" ? "black" : "white" },
      })
    );
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    //  to make sure that the move is made by the correct player
    if (this.board.moves.length % 2 === 0 && socket !== this.player1) {
      return;
    }
    if (this.board.moves.length % 2 === 1 && socket !== this.player2) {
      return;
    }

    try {
      // validate move
      this.board.move(move);
    } catch (error) {
      return;
    }

    // check if the game is over
    if (this.board.isGameOver()) {
      // send GAME_OVER message to both players
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        })
      );

      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        })
      );
    }

    // tell the other player the move has been made
    if (this.board.moves.length % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
  }
}
