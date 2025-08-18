"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedBrain = exports.shareBrain = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const link_model_1 = require("../models/link.model");
const content_model_1 = require("../models/content.model");
const user_model_1 = require("../models/user.model");
const utils_1 = require("../utils/utils");
exports.shareBrain = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user._id;
    const { share } = req.body;
    if (!userId) {
        throw new apiError_1.default(401, 'Unauthorized');
    }
    if (share) {
        const existingLink = yield link_model_1.linkModel.findOne({ userId });
        if (existingLink) {
            return res.status(200).json(new apiResponse_1.default(200, { hash: existingLink.hash }));
        }
        const hash = (0, utils_1.random)(10);
        yield link_model_1.linkModel.create({ userId, hash });
        return res.status(201).json(new apiResponse_1.default(201, { hash }));
    }
    yield link_model_1.linkModel.deleteOne({ userId });
    res.status(200).json(new apiResponse_1.default(200, null, 'Removed Link'));
}));
exports.getSharedBrain = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shareLink } = req.params;
    const link = yield link_model_1.linkModel.findOne({ hash: shareLink });
    if (!link) {
        throw new apiError_1.default(404, 'Link not found');
    }
    const content = yield content_model_1.ContentModel.find({ userId: link.userId });
    const user = yield user_model_1.userModel.findOne({ _id: link.userId });
    if (!user) {
        throw new apiError_1.default(404, 'User not found');
    }
    res.status(200).json(new apiResponse_1.default(200, { username: user.username, content }));
}));
