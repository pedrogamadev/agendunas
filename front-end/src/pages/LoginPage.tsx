import type { PageProps } from '../App'
import AuthPortal from './AuthPortal'

function LoginPage(props: PageProps) {
  return <AuthPortal {...props} initialMode="login" variant="admin" />
}

export default LoginPage
