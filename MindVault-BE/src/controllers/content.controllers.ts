import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { ContentModel } from '../models/content.model';


export const createContent = asyncHandler(async (req: Request, res: Response) => {
  const { link, type, title } = req.body as { link?: string; type?: string; title?: string };
  const user = (req as any).user;
  const userId = user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!link) {
    throw new ApiError(400, 'Link is required');
  }

  const created = await ContentModel.create({
    link,
    type,
    title,
    userId,
    tags: []
  });

  res.status(201).json(new ApiResponse(201, created, 'Content created successfully'));
});


export const listContent = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const content = await ContentModel.find({ userId }).populate('userId', 'username');
  res.status(200).json(new ApiResponse(200, content, 'Content fetched successfully'));
});


export const deleteContentById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user?._id;
  const contentId = req.params.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!contentId) {
    throw new ApiError(400, 'Content id is required');
  }

  const result = await ContentModel.deleteOne({ _id: contentId, userId });

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Content not found');
  }

  res.status(200).json(new ApiResponse(200, { id: contentId }, 'Content deleted successfully'));
});


