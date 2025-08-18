"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./loadEnv.js");
const index_js_1 = __importDefault(require("./db/index.js"));
const app_js_1 = require("./app.js");
(0, index_js_1.default)()
    .then(() => {
    app_js_1.app.on("error", () => {
        console.log("Server error occurred");
        process.exit(1);
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 8000;
    app_js_1.app.listen(port, () => {
        console.log(`Server is running at the port : ${port}`);
    });
})
    .catch((error) => {
    console.log("MongoDB connection Failed!!", error);
});
