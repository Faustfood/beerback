import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Geschützte Routen (App-Bereich)
  const protectedPaths = ['/home', '/add-beer', '/wallet', '/map', '/profile']
  const isProtected = protectedPaths.some((p) => path.startsWith(p))

  // Auth-Routen
  const authPaths = ['/login']
  const isAuth = authPaths.some((p) => path.startsWith(p))

  // Onboarding-Check: Wenn eingeloggt aber kein Profil → Onboarding
  if (user && (isProtected || path === '/onboarding')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('pseudonym, age_verified')
      .eq('id', user.id)
      .single()

    // Kein Profil → Onboarding
    if (!profile && path !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Profil komplett → /onboarding ist nicht mehr nötig
    if (profile && profile.age_verified && path === '/onboarding') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  // Nicht eingeloggt + geschützte Route → Login
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Eingeloggt + auf Login-Seite → Home
  if (user && isAuth) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
