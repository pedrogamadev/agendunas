import { Router } from 'express'
import { getCalendar } from '../../controllers/admin/get-calendar.js'
import { getOverview } from '../../controllers/admin/get-overview.js'
import { getReports } from '../../controllers/admin/get-reports.js'
import { listBookings } from '../../controllers/admin/list-bookings.js'
import { listEvents } from '../../controllers/admin/list-events.js'
import { listParticipants } from '../../controllers/admin/list-participants.js'
import { listTrails } from '../../controllers/admin/list-trails.js'

const router = Router()

router.get('/overview', getOverview)
router.get('/bookings', listBookings)
router.get('/participants', listParticipants)
router.get('/events', listEvents)
router.get('/trails', listTrails)
router.get('/calendar', getCalendar)
router.get('/reports', getReports)

export default router
