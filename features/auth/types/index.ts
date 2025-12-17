export interface SignUpData {
  userName: string
  email: string
  password: string
}

export interface SignInData {
  emailOrUserName: string
  password: string
}

export interface UserInfoUpdateData {
  userName: string
  email: string
}

export interface AuthResult {
  success: boolean
  error?: string
}
