import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { env } from '@/shared/config/env';
import { UserRepository } from '@/features/auth/repo.impl';
import { AuthenticateUserUseCase } from '@/features/auth/usecases/authenticate-user.usecase';
import { loginSchema } from '@/entities/user/model/user.schema';

/**
 * Configuración de Auth.js (NextAuth v5)
 *
 * Providers:
 * - Credentials (email + password) - MVP
 * - Google OAuth (futuro)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          // Validar input
          const validated = loginSchema.parse(credentials);

          // Instanciar repositorio y caso de uso
          const userRepository = new UserRepository();
          const authenticateUser = new AuthenticateUserUseCase(userRepository);

          // Autenticar
          const user = await authenticateUser.execute(validated);

          // Retornar usuario en formato Auth.js
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          // Auth.js espera null si las credenciales son inválidas
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // Proteger rutas: retornar true si está autenticado
      return !!auth;
    },
    jwt: async ({ token, user }) => {
      // Agregar datos del usuario al token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Agregar datos del token a la sesión
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.NEXTAUTH_SECRET,
});
