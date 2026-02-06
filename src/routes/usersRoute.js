import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getAllusers ,getUserById } from "../controllers/userController";

const usersRoute = Router();

usersRoute.get("/",authenticate,getAllusers);
usersRoute.get("/users/:id",authenticate,getUserById);
