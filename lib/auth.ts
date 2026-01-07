import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Lazy import - only load at runtime
function getUserDb() {
  return require('@/lib/db').userDb;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userDb = getUserDb();
          const user: any = await userDb.getByEmail(credentials.email);
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatar_url,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/onboarding', // Redirect new users to onboarding
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      // Always fetch fresh user data from Supabase on initial sign-in or session update
      // This ensures organization info is always up-to-date after onboarding
      if (token.email && (trigger === 'signIn' || trigger === 'update' || !token.organizationId)) {
        try {
          const userDb = getUserDb();
          const dbUser: any = await userDb.getByEmail(token.email as string);
          if (dbUser) {
            token.id = dbUser.id;
            token.organizationId = dbUser.organization_id;
            token.role = dbUser.role;
            token.needsOnboarding = false;
          } else {
            // User not in database - needs onboarding
            token.needsOnboarding = true;
            token.organizationId = null;
          }
        } catch (error) {
          console.error('Error fetching user from DB:', error);
          token.needsOnboarding = true;
          token.organizationId = null;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).provider = token.provider;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).role = token.role;
        (session.user as any).needsOnboarding = token.needsOnboarding;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Allow all sign-ins - onboarding will handle new user setup
      if (!user.email) return false;
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after sign in
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'build-time-placeholder-secret',
  debug: process.env.NODE_ENV === 'development',
};
