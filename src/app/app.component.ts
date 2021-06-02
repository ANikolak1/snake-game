import { Component } from '@angular/core';
import {AppService} from "./app.service";
import {BOARD_SIZE, COLORS, CONTROLS} from "./constants";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {
  isGamePaused: boolean = false;
  board = [];
  score: number = 0;
  gameStarted: boolean = false;
  newBestScore: boolean = false;
  // public photo: string = sourceUrl("http://www.hdwallpaperspulse.com/wp-content/uploads/2015/08/10/dangerous-black-snake-background.jpg");
  best_score = this.appService.retrieve();
  // @ts-ignore
  $event: KeyboardEvent;

  private interval: number = 0;
  private tempDirection: number = 0;
  private default_mode: string = 'classic';
  private isGameOver: boolean = false;
  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };
  private fruit = {
    x: -1,
    y: -1
  };

  constructor(private appService: AppService) {
    this.setBoard();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.keyCode == CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    } else if (e.keyCode === CONTROLS.PAUSE && !this.isGamePaused) {
      this.isGamePaused = true;
      // this.interval = 1000000000000000000000^10000000000000000000;
    } else if (e.keyCode === CONTROLS.PAUSE && this.isGamePaused) {
      this.isGamePaused = false;
      this.interval = 120;
      this.updatePositions();
    }
  }

  setColors(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.fruit.x === row && this.fruit.y === col) {
      return COLORS.FRUIT;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.board[col][row] === true) {
      return COLORS.BODY;
    }
    return COLORS.BOARD;
  };

  updatePositions(): void {
    let newHead = this.repositionHead();
    let me = this;
    if (this.default_mode === 'classic') {
      if (this.boardCollision(newHead)) {
        return this.gameOver();
      }
    }
    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit();
    }
    let oldTail = this.snake.parts.pop();
    // @ts-ignore
    this.board[oldTail.y][oldTail.x] = false;
    this.snake.parts.unshift(newHead);
    // @ts-ignore
    this.board[newHead.y][newHead.x] = true;
    this.snake.direction = this.tempDirection;

    if (!this.isGamePaused) {
      setTimeout(() => {
        me.updatePositions();
      }, this.interval);
    }
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }
    return newHead;
  }

  boardCollision(part: any): boolean {
    return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  fruitCollision(part: any): boolean {
    return part.x === this.fruit.x && part.y === this.fruit.y;
  }

  resetFruit(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true) {
      return this.resetFruit();
    }

    this.fruit = {
      x: x,
      y: y
    };
  }

  eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFruit();

    if (this.score % 5 === 0) {
      this.interval -= 15;
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    let me = this;

    if (this.score > this.best_score) {
      this.appService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    setTimeout(() => {
      me.isGameOver = false;
    }, 500);

    this.setBoard();
  }

  randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

  setBoard(): void {
    this.board = [];
    for (var i = 0; i < BOARD_SIZE; i++) {
      // @ts-ignore
      this.board[i] = [];
      for (var j = 0; j < BOARD_SIZE; j++) {
        // @ts-ignore
        this.board[i][j] = false;
      }
    }
  }

  newGame(): void {
    this.default_mode = 'classic';
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.tempDirection = CONTROLS.LEFT;
    this.isGameOver = false;
    this.interval = 120;
    this.snake = {
      direction: CONTROLS.LEFT,
      parts: []
    };

    for (var i = 0; i < 3; i++) {
      this.snake.parts.push({x: 8 + i, y: 8});
    }
    this.resetFruit();
    this.updatePositions();
  }
}
