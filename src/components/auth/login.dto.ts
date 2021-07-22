import { UserBasicDto } from "../users/users.dto";

export interface LoginDto {
  token: string;
  refreshToken: string;
  user: UserBasicDto;
}

export interface LoginBodyDto {
  email: string;
  password: string;
}

export interface RefreshTokenBodyDto {
  refreshToken: string;
}
