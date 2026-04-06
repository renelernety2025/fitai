import { NextResponse } from 'next/server';
const protectedPaths = ['/dashboard', '/videos', '/workout'];
const authPaths = ['/login', '/register'];
export function middleware(request) {
    const token = request.cookies.get('fitai_token')?.value;
    const { pathname } = request.nextUrl;
    // For protected routes: check localStorage token via a simple cookie check
    // Since localStorage isn't available in middleware, we use a lightweight approach:
    // The actual auth check happens client-side via AuthProvider.
    // This middleware provides a basic redirect for auth pages when cookie is set.
    if (authPaths.some((p) => pathname.startsWith(p)) && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
}
export const config = {
    matcher: ['/dashboard/:path*', '/videos/:path*', '/workout/:path*', '/login', '/register'],
};
//# sourceMappingURL=middleware.js.map