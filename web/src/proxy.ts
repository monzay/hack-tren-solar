import { NextResponse, type NextRequest } from "next/server";

// Redirección optimista: solo mira si existe la cookie. La verificación real
// del token la hace cada Route Handler con requiereSesion().
export function proxy(req: NextRequest) {
  if (!req.cookies.get("sesion")?.value) {
    const url = req.nextUrl.clone();
    const siguiente = req.nextUrl.pathname + req.nextUrl.search;
    url.pathname = "/login";
    url.search = `?siguiente=${encodeURIComponent(siguiente)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/operador/:path*", "/admin/:path*", "/estadisticas/:path*", "/informes/:path*"],
};
