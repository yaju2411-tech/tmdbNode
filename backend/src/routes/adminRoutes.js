import express from "express";
import {
    getAdmins,
    getUsers,
    getMoviePurchases,
    getStats,
    updateUserByAdmin,
    updateAdmin,
    deleteUserByAdmin,
    forceVerifyUser
} from "../controllers/admin/adminController.js";

import protect from "../middleware/authMiddlware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Secure all admin routes
router.use(protect);
router.use(adminOnly);

// Profile & stats management
router.get("/admins", getAdmins);
router.get("/users", getUsers);
router.get("/purchases", getMoviePurchases);
router.get("/stats", getStats);

router.post("/user/force-verify", forceVerifyUser);
router.put("/user/:id", upload.single("avatar"), updateUserByAdmin);
router.put("/profile/:id", upload.single("avatar"), updateAdmin);
router.delete("/user/:id", deleteUserByAdmin);

// Payment ticket management & verifications

// General customer support ticketing & notifications


export default router;
