import PasswordField from '#/components/auth/password-field'
import { useState } from 'react'
import { describe, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

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
})
