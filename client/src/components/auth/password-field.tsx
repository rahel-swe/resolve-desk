import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useShowPassword } from '#/hooks/useShowPassword'
import { EyeOffIcon, EyeIcon } from '@hugeicons/core-free-icons'
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
    <div className="space-y-2">
      <label
        className="block text-sm font-medium text-foreground"
        htmlFor="password"
      >
        Password
      </label>

      <div className="relative">
        <Input
          id="password"
          name="password"
          type={isShowPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter your password"
          autoComplete={autoComplete}
          disabled={disabled}
          className="pr-12"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-0.5 right-1 text-muted-foreground hover:text-foreground"
          onClick={onClickShowPassword}
          disabled={disabled}
          aria-label={isShowPassword ? 'Hide password' : 'Show password'}
        >
          <HugeiconsIcon
            className="size-4"
            strokeWidth={1.8}
            icon={isShowPassword ? EyeOffIcon : EyeIcon}
          />
        </Button>
      </div>
    </div>
  )
}

export default PasswordField
