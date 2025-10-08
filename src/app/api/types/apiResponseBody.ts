export type ApiResponseBody<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
};
