import type { PageProps } from '../App'
import AuthPortal from './AuthPortal'

function RegisterPage(props: PageProps) {
  return <AuthPortal {...props} initialMode="register" />
}

export default RegisterPage
