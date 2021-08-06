import "reflect-metadata";
import express from "express";

import debug from "debug";
import helmet from "helmet";
import configs from "./src/configs/index";
import logger from "./src/common/logger";
import morgan from "morgan";

import { CommonRoutesConfig } from "./src/common/common.routes.config";
import { ErrorInterface } from "./src/common/interfaces/error-interface";
import { UserRoutes } from "./src/components/users/users.routes";
import { LoginRoutes } from "./src/components/auth/login.routes";
import { LogoutRoutes } from "./src/components/auth/logout.routes";
import { ThingRoutes } from "./src/components/things/things.routes";
import { ExpenseRoutes } from "./src/components/expenses/expenses.routes";

const app: express.Application = express();

const debugLog: debug.IDebugger = debug("app");

app.use(express.json());

// adding some secure headers
app.use(helmet());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

const routes: Array<CommonRoutesConfig> = [];
routes.push(new ThingRoutes());
routes.push(new UserRoutes());
routes.push(new LoginRoutes());
routes.push(new LogoutRoutes());
routes.push(new ExpenseRoutes());

routes.forEach((route) => {
  debugLog(`Routes configured for ${route.getName()}`);
  const routerRoutes: express.Router = route.initializeRoutes();
  app.use(`${configs.app.BASE_PATH}/${route.getName()}`, routerRoutes);
});

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send({
    message: "The application is running",
  });
});

// error handler
app.use((err: ErrorInterface, req: express.Request, res: express.Response, next) => {
  logger.error("error", { err });

  res.status(err.errorStatusCode || 500).json({
    error: err.message,
    detail: err.errorDetail,
  });
});

export default app;
