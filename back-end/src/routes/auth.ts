import { Router } from 'express'
import { customerLogin } from '../controllers/auth/customer-login.js'
import { customerRegister } from '../controllers/auth/customer-register.js'
import { login } from '../controllers/auth/login.js'
import { me } from '../controllers/auth/me.js'
import { register } from '../controllers/auth/register.js'
import { authenticate } from '../middlewares/authenticate.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/customer/login', customerLogin)
router.post('/customer/register', customerRegister)
router.get('/me', authenticate, me)

export default router
