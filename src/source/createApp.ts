import express, { Request, Response, NextFunction } from "express";
import logger from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { TOptions } from "../types/source";
import Source from ".";
import { isUndefined } from "../utils/isUndefined";
import http from "http";
import dotenv from "dotenv";

class CreateApp extends Source {
  protected port;
  constructor() {
    super();
    dotenv.config();
    if (process.env.PORT) {
      this.port = parseInt(process.env.PORT, 10);
    } else {
      this.port = 3000;
    }
  }
  createRouter() {
    const router = express.Router();
    return router;
  }
  createApp(options: TOptions) {
    if (!isUndefined(options.viewsPaths)) {
      options.viewsPaths.forEach((viewPath) => {
        this.viewsPath.push(viewPath);
      });
      this.app.set("views", this.viewsPath);
      if (!isUndefined(options.viewEngine)) {
        this.viewEngine = options.viewEngine;
        this.app.set("view engine", this.viewEngine);
      }
    }

    if (process.env.DEV === "on") {
      this.app.use(logger("dev"));
    }

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    if (!isUndefined(options.appUses) && Array.isArray(options.appUses)) {
      if (options.appUses.length > 0) {
        options.appUses.forEach((appUse) => {
          this.app.use(appUse);
        });
      }
    }

    if (!isUndefined(options.staticDir)) {
      this.app.use(express.static(options.staticDir));
    }

    if (!isUndefined(options.router)) {
      this.app.use("/", options.router);
    }

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const err = new Error("Not Found");
      const status = 404;
      next({ error: err, status });
    });

    this.app.use(
      (
        err: { error: Error; status: number },
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        res.status(err.status || 500);

        const develop = this.app.get("env") === "development";
        const accept = req.get("accept");
        const error = {
          message: err.error.message,
          error: develop ? err : {},
        };

        if (!isUndefined(accept)) {
          res.json(error);
        }
      }
    );
    this.createServer();
  }
  private createServer() {
    this.app.set("port", this.port);

    const server = http.createServer(this.app);

    server.listen(this.port);
    server.on("error", this.onError);
    server.on("listening", () => {
      const addr = server.address();
      const bind =
        typeof addr === "object" && addr !== null
          ? `port ${addr.port}`
          : `pipe ${addr}`;
      console.log(`Listening on ${bind}`);
    });
  }

  private onError(error: any) {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind =
      typeof this.port === "string" ? `Pipe ${this.port}` : `Port ${this.port}`;

    switch (error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}

export default new CreateApp();
