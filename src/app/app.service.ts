import { Injectable } from '@angular/core';

@Injectable()
export class AppService {

  constructor() { }
  private snakeScore: string = 'snakeGame';

  public store(score: number) {
    localStorage.setItem(this.snakeScore, JSON.stringify({ "best_score": score }));
  }

  public retrieve() {
    let storedToken = this.parse();
    if (!storedToken) {
      this.store(0);
      storedToken = this.parse();
    }

    return storedToken.best_score;
  }

  private parse() {
    return JSON.parse(<string>localStorage.getItem(this.snakeScore));
  }

}
