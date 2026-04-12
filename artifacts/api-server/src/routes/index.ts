import { Router, type IRouter } from "express";
import healthRouter from "./health";
import collectionRouter from "./collection";
import checkoutRouter from "./checkout";

const router: IRouter = Router();

router.use(healthRouter);
router.use(collectionRouter);
router.use(checkoutRouter);

export default router;
