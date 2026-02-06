import { Router } from "express";
import { getServices } from "../controllers/serviceController";

const servicesRouter = Router();

servicesRouter.get("/",getServices);