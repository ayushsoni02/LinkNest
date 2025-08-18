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
exports.deleteContentById = exports.listContent = exports.createContent = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const content_model_1 = require("../models/content.model");
exports.createContent = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title } = req.body;
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user._id;
    if (!userId) {
        throw new apiError_1.default(401, 'Unauthorized');
    }
    if (!link) {
        throw new apiError_1.default(400, 'Link is required');
    }
    const created = yield content_model_1.ContentModel.create({
        link,
        type,
        title,
        userId,
        tags: []
    });
    res.status(201).json(new apiResponse_1.default(201, created, 'Content created successfully'));
}));
exports.listContent = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user._id;
    if (!userId) {
        throw new apiError_1.default(401, 'Unauthorized');
    }
    const content = yield content_model_1.ContentModel.find({ userId }).populate('userId', 'username');
    res.status(200).json(new apiResponse_1.default(200, content, 'Content fetched successfully'));
}));
exports.deleteContentById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user._id;
    const contentId = req.params.id;
    if (!userId) {
        throw new apiError_1.default(401, 'Unauthorized');
    }
    if (!contentId) {
        throw new apiError_1.default(400, 'Content id is required');
    }
    const result = yield content_model_1.ContentModel.deleteOne({ _id: contentId, userId });
    if (result.deletedCount === 0) {
        throw new apiError_1.default(404, 'Content not found');
    }
    res.status(200).json(new apiResponse_1.default(200, { id: contentId }, 'Content deleted successfully'));
}));
