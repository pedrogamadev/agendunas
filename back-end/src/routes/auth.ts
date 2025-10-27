import { Router } from 'express'
import { login } from '../controllers/auth/login.js'
import { me } from '../controllers/auth/me.js'
import { register } from '../controllers/auth/register.js'
import { authenticate } from '../middlewares/authenticate.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/me', authenticate, me)

export default router
