export interface UserDto {
  fullName?: string;
  age?: number;
  email: string;
  password: string;
}

export interface UserBasicDto {
  id: string;
  fullName?: string;
  age?: number;
  email: string;
}

export interface ReportQuery {
  interval: string;
  groupBy?: string[];
  minDate: string;
  maxDate: string;
}
