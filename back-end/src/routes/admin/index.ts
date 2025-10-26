import { Router } from 'express'
import { getCalendar } from '../../controllers/admin/get-calendar.js'
import { getOverview } from '../../controllers/admin/get-overview.js'
import { getReports } from '../../controllers/admin/get-reports.js'
import { listBookings } from '../../controllers/admin/list-bookings.js'
import { listEvents } from '../../controllers/admin/list-events.js'
import { listParticipants } from '../../controllers/admin/list-participants.js'
import { listTrails } from '../../controllers/admin/list-trails.js'
import { createTrail } from '../../controllers/admin/create-trail.js'
import { updateTrail } from '../../controllers/admin/update-trail.js'
import { deleteTrail } from '../../controllers/admin/delete-trail.js'
import { createGuide } from '../../controllers/admin/create-guide.js'
import { deleteGuide } from '../../controllers/admin/delete-guide.js'
import { listGuides } from '../../controllers/admin/list-guides.js'
import { updateGuide } from '../../controllers/admin/update-guide.js'

const router = Router()

router.get('/overview', getOverview)
router.get('/bookings', listBookings)
router.get('/participants', listParticipants)
router.get('/events', listEvents)
router.get('/trails', listTrails)
router.post('/trails', createTrail)
router.put('/trails/:id', updateTrail)
router.delete('/trails/:id', deleteTrail)
router.get('/calendar', getCalendar)
router.get('/reports', getReports)
router.get('/guides', listGuides)
router.post('/guides', createGuide)
router.put('/guides/:id', updateGuide)
router.delete('/guides/:id', deleteGuide)

export default router
