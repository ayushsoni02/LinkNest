"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middlewares/middleware");
const brain_controllers_1 = require("../controllers/brain.controllers");
const router = (0, express_1.Router)();
router.post('/share', middleware_1.userMiddleware, brain_controllers_1.shareBrain);
router.get('/:shareLink', brain_controllers_1.getSharedBrain);
exports.default = router;
