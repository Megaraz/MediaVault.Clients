export interface UserDetailedDto {
  id: string;
  username: string;
  email: string;
  createdAtUtc: string;
}

export interface UserMinimalDto {
  id: string;
  username: string;
  email: string;
}

export interface UserRegisterDto {
  username: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

export interface UserUpdateDto {
  userName: string;
  email: string;
}

export interface UserLoginDto {
  userNameOrEmail: string;
  password: string;
}
