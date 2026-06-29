import catchAsync from "@/utils/catchAsync.js";
import type { Request, Response } from "express";

const loginUserIntoDB = catchAsync(async (req: Request, res: Response) => {

})

export const AuthServices = {
  login : loginUserIntoDB
}