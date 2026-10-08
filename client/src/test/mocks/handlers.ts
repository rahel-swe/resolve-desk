import { API_BASE_URL } from '#/lib/api'
import { http, HttpResponse } from 'msw/http'

export const handlers = [
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    return HttpResponse.json({
      isSuccess: true,
      message: 'Signed in successfully.',
      data: {
        token: 'test-access-token',
        refreshToken: 'test-refresh-token',
        email: body.email,
        role: 'Customer',
      },
    })
  }),
]
