import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { linkModel } from '../models/link.model';
import { ContentModel } from '../models/content.model';
import { userModel } from '../models/user.model';
import { random } from '../utils/utils';


export const shareBrain = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user?._id;
  const { share } = req.body as { share?: boolean };

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (share) {
    const existingLink = await linkModel.findOne({ userId });
    if (existingLink) {
      return res.status(200).json(new ApiResponse(200, { hash: existingLink.hash }));
    }
    const hash = random(10);
    await linkModel.create({ userId, hash });
    return res.status(201).json(new ApiResponse(201, { hash }));
  }

  await linkModel.deleteOne({ userId });
  res.status(200).json(new ApiResponse(200, null, 'Removed Link'));
});

export const getSharedBrain = asyncHandler(async (req: Request, res: Response) => {
  const { shareLink } = req.params as { shareLink: string };

  const link = await linkModel.findOne({ hash: shareLink });
  if (!link) {
    throw new ApiError(404, 'Link not found');
  }

  const content = await ContentModel.find({ userId: link.userId });
  const user = await userModel.findOne({ _id: link.userId });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, { username: user.username, content }));
});


