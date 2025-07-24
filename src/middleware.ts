
import { NextResponse } from "next/server";
import { auth } from "@/auth"
import { stripAppSubdomain } from "./lib/utils";

const PUBLIC_PATHS = ["/auth"];
export default auth(async (req) => {

    const hostname = req.headers.get('host')!;
    const subdomain = hostname.match(/^([^.]+)\./)?.[1];
    const pathname = req.nextUrl.pathname
    // const issubdomain = subdomain?.startsWith('app');

    const host = stripAppSubdomain(req.headers.get('host')?.toString() as string);



    if (!subdomain) {
        const isPublicPath = PUBLIC_PATHS.some((publicpath) => pathname.startsWith(publicpath));
        if (!isPublicPath) {
            return NextResponse.redirect(new URL(`http://biggyexchange.${host}${pathname}`, req.url));
        }
        console.log("redirecting to app");

        return NextResponse.next();
    }


    switch (subdomain) {

        ///change the case back to app later when he has bought a domain
        case "biggyexchange":
        //case "app":
            {
                const PROTECTED_PATHS = ["/user_dashboard", "/wallet", "/otc", "/profile", "/profile/overview", "/profile/security", "/profile/user_kyc", "/profile/task", "/wallet/payment/crypto", "/wallet/transaction", "/otc", "/otc/advertisement", "/otc/advertisement/atok", "/otc/advertisement/opin", "/otc/advertisement/rbl", "/otc/advertisement/sda", "/otc/advertisement/star", "/otc/advertisement/wow"]; // Add all your exact protected paths here
                const isProtectedPath = PROTECTED_PATHS.includes(pathname);
                const isLoggedin = req.auth
                if (!isLoggedin && isProtectedPath) {
                    return NextResponse.redirect(new URL(`/auth`, req.url));
                }
                return NextResponse.rewrite(new URL(`/app${req.nextUrl.pathname}`, req.url));

            }

            /// chnage the case back to admin or web when he has bought a domain
        case "adminBiggyexchange":
        //case "web":
            {
                const PROTECTED_PATHS = ["/", "/profile", "/settings", "/checkout", "/orders"]; // Add all your exact protected paths here
                const isProtectedPath = PROTECTED_PATHS.includes(pathname);
                const isLoggedin = req.auth
                if (!isLoggedin && isProtectedPath) {
                    return NextResponse.redirect(new URL(`/auth`, req.url));
                }
                return NextResponse.rewrite(new URL(`/admin${req.nextUrl.pathname}`, req.url));
            }
            case "api":
                {
                    return NextResponse.rewrite(new URL(`/api${req.nextUrl.pathname}`, req.url));
                }

        default:
            return NextResponse.next();
    }
    // return NextResponse.rewrite(new URL(`/app${req.nextUrl.pathname}`, req.url));
    // // return NextResponse.next();

})


export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next (Next.js internals)
         * - static (static files)
         * - favicon.ico, robots.txt, etc.
         */
        // "/((?!_next|images|favicon.ico|robots.txt|sitemap.xml).*)",
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+$|.*\\.[^/]+$).*)",
        // "/((?!_next/|favicon.ico|robots.txt|manifest.json|static/|.*\\..*).*)",

    ],
};