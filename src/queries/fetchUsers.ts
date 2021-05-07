import { User } from "@prisma/client"

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users')
  const data: User[] = await response.json()
  return data
};