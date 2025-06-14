import { Router } from "express";
import { mockData, mockPets, mockUsers } from "../controllers/mockControllers.js";

const router = Router();

router.get('/mockingpets', mockPets)

router.get('/mockingusers', mockUsers)
router.post('/generateData', mockData)


export default router
