import { Router } from 'express'
import { createBooking } from '../controllers/public/create-booking.js'
import { getFaunaFlora } from '../controllers/public/get-fauna-flora.js'
import { getGuides } from '../controllers/public/get-guides.js'
import { getTrails } from '../controllers/public/get-trails.js'

const router = Router()

router.get('/guides', getGuides)
router.get('/trails', getTrails)
router.get('/fauna-flora', getFaunaFlora)
router.post('/bookings', createBooking)

export default router
