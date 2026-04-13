import { Router, type IRouter } from "express";
import healthRouter from "./health";
import collectionRouter from "./collection";
import checkoutRouter from "./checkout";
import usersRouter from "./users";
import ordersRouter from "./orders";
import wishlistsRouter from "./wishlists";
import addressesRouter from "./addresses";
import storageRouter from "./storage";
import adminCollectionRouter from "./admin-collection";

const router: IRouter = Router();

router.use(healthRouter);
router.use(collectionRouter);
router.use(checkoutRouter);
router.use(usersRouter);
router.use(ordersRouter);
router.use(wishlistsRouter);
router.use(addressesRouter);
router.use(storageRouter);
router.use(adminCollectionRouter);

export default router;
