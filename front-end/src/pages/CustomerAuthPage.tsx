import type { PageProps } from '../App'
import CustomerPortal from './CustomerPortal'

function CustomerAuthPage(props: PageProps) {
  return <CustomerPortal {...props} initialMode="login" variant="customer" />
}

export default CustomerAuthPage
