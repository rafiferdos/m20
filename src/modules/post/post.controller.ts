import catchAsync from "@/utils/catchAsync.js";
import type { Request, Response } from "express";

const createPost = catchAsync(async (req: Request, res: Response) => {
  
})

export const PostController = {
  create: createPost
}