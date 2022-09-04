import express, { Express } from "express";

export default class Source {
  protected app: Express;
  protected viewsPath: Array<string>;
  protected viewEngine?: string;

  constructor() {
    this.app = express();
    this.viewsPath = [];
  }
}
