import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: 'ADMIN' | 'USER'
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: 'ADMIN' | 'USER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'USER'
    name?: string | null
    email?: string
  }
}
