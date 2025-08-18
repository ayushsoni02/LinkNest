"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const content_route_1 = __importDefault(require("./routes/content.route"));
const brain_route_1 = __importDefault(require("./routes/brain.route"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express_1.default.json({ limit: "4mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use(express_1.default.static("public"));
app.use("/api/v1/users", user_route_1.default);
app.use("/api/v1/content", content_route_1.default);
app.use("/api/v1/brain", brain_route_1.default);
