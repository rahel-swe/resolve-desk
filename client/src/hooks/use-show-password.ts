import { useState } from 'react'

export const useShowPassword = (): {
  isShowPassword: boolean
  onClickShowPassword: () => void
} => {
  const [isShowPassword, setIsShowPassword] = useState(false)

  const onClickShowPassword = () => {
    setIsShowPassword(!isShowPassword)
  }

  return { isShowPassword, onClickShowPassword }
}
