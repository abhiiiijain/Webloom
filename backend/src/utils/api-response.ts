import type { Response } from "express";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "OK",
  status = 200,
) => {
  res.status(status).json({ success: true, message, data } satisfies ApiSuccess<T>);
};

export const sendError = (
  res: Response,
  message: string,
  status = 400,
  errors?: ApiError["errors"],
) => {
  res.status(status).json({ success: false, message, errors } satisfies ApiError);
};
