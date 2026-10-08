import PasswordField from '#/components/auth/password-field'
import { useState } from 'react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { server } from '#/test/mocks/server'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/api'
import { signInWithApi } from '#/services/auth-service'

function PasswordFieldHarness() {
  const [password, setPassword] = useState('')

  return (
    <PasswordField
      value={password}
      onChange={setPassword}
      autoComplete="current-password"
    />
  )
}

describe('PasswordField', () => {
  it('allows the user to enter and reveal thier password', async () => {
    const user = userEvent.setup()

    render(<PasswordFieldHarness />)

    const passwordInput = screen.getByLabelText('Password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    expect(passwordInput).toHaveValue('')

    await user.type(passwordInput, 'Secret123!')

    expect(passwordInput).toHaveValue('Secret123!')

    await user.click(
      screen.getByRole('button', {
        name: 'Show password',
      }),
    )

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', {
        name: 'Hide password',
      }),
    ).toBeInTheDocument()
  })

  describe('signInWithApi', () => {
    it('sends the credentials and returns the authenticated session', async () => {
      const email = 'customer@example.com'
      const password = 'Secret123!'

      const expectedSession = {
        token: 'access-token',
        refreshToken: 'refresh-token',
        email,
        role: 'Customer',
      }

      server.use(
        http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
          expect(request.headers.get('content-type')).toBe('application/json')

          expect(await request.json()).toEqual({
            email,
            password,
          })

          return HttpResponse.json({
            isSuccess: true,
            message: 'Signed in successfully.',
            data: expectedSession,
          })
        }),
      )

      const session = await signInWithApi(email, password)

      expect(session).toEqual(expectedSession)
    })

    it('throws the API message when the credentials are rejected', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/auth/login`, () => {
          return HttpResponse.json(
            {
              isSuccess: false,
              message: 'Email or password is incorrect.',
              data: null,
            },
            {
              status: 401,
            },
          )
        }),
      )

      await expect(
        signInWithApi('customer@example.com', 'wrong-password'),
      ).rejects.toThrow('Email or password is incorrect.')
    })
  })
})
