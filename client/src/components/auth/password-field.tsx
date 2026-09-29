import { Input } from '#/components/ui/input'
import { useShowPassword } from '#/hooks/useShowPassword'
import { EyeClosedIcon, EyeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type PasswordFieldProps = {
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  disabled?: boolean
}

function PasswordField({
  value,
  onChange,
  autoComplete,
  disabled = false,
}: PasswordFieldProps) {
  const { isShowPassword, onClickShowPassword } = useShowPassword()

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="password"
        >
          Password
        </label>

        <button
          type="button"
          onClick={onClickShowPassword}
          disabled={disabled}
          aria-label={isShowPassword ? 'Hide password' : 'Show password'}
        >
          <HugeiconsIcon
            className="size-5"
            icon={isShowPassword ? EyeClosedIcon : EyeIcon}
          />
        </button>
      </div>

      <Input
        id="password"
        name="password"
        type={isShowPassword ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="********"
        autoComplete={autoComplete}
        disabled={disabled}
        required
      />
    </div>
  )
}

export default PasswordField
