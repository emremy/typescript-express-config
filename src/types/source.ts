import { Router } from "express";

export type TOptions = {
  appUses?: Array<unknown>;
  viewsPaths?: Array<string>;
  viewEngine?: string;
  staticDir?: string;
  router?: Router;
};
