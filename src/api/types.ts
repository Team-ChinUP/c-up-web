export type Gender = "MALE" | "FEMALE";

export type ApiSuccessResponse<T> = {
  status: number;
  data: T;
  message: string;
};

export type ApiErrorResponse = {
  status: number;
  message: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ActionResult = {
  state: boolean;
  message: string;
};

export type SignInRequestDto = {
  email: string;
  password: string;
};

export type SignInResponseDto = {
  accessToekn: string;
  refreshToken: string;
};

export type SignUpRequestDto = {
  email: string;
  password: string;
  name: string;
  gender: Gender;
};

export type ReissueRequestDto = {
  refreshToken: string;
};

export type ReissueResponseDto = {
  accessToken: string;
  refreshToken: string;
};

export type MyRoomResponseDto = {
  roomId: number;
};
