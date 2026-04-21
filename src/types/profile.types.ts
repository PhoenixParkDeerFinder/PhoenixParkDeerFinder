export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  username: string
  role: UserRole
  updated_at: string
}