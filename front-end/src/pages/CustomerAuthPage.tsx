import type { PageProps } from '../App'
import CustomerPortal from './CustomerPortal'

function CustomerAuthPage(props: PageProps) {
  return <CustomerPortal {...props} initialMode="login" />
}

export default CustomerAuthPage
