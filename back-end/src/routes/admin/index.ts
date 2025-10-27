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
import { listTrailSessions } from '../../controllers/admin/list-trail-sessions.js'
import { createTrailSession } from '../../controllers/admin/create-trail-session.js'
import { updateTrailSession } from '../../controllers/admin/update-trail-session.js'
import { deleteTrailSession } from '../../controllers/admin/delete-trail-session.js'
import { listTrailSessionParticipants } from '../../controllers/admin/list-trail-session-participants.js'
import { createGuide } from '../../controllers/admin/create-guide.js'
import { createInvite } from '../../controllers/admin/create-invite.js'
import { deleteGuide } from '../../controllers/admin/delete-guide.js'
import { listGuides } from '../../controllers/admin/list-guides.js'
import { updateGuide } from '../../controllers/admin/update-guide.js'
import { getBooking } from '../../controllers/admin/get-booking.js'
import { updateBookingStatus } from '../../controllers/admin/update-booking-status.js'
import { getParticipant } from '../../controllers/admin/get-participant.js'
import { updateParticipant } from '../../controllers/admin/update-participant.js'
import { createEvent } from '../../controllers/admin/create-event.js'

const router = Router()

router.get('/overview', getOverview)
router.get('/bookings', listBookings)
router.get('/bookings/:id', getBooking)
router.patch('/bookings/:id/status', updateBookingStatus)
router.get('/participants', listParticipants)
router.get('/participants/:id', getParticipant)
router.patch('/participants/:id', updateParticipant)
router.get('/events', listEvents)
router.post('/events', createEvent)
router.get('/trails', listTrails)
router.post('/trails', createTrail)
router.put('/trails/:id', updateTrail)
router.delete('/trails/:id', deleteTrail)
router.get('/trails/:trailId/sessions', listTrailSessions)
router.post('/trails/:trailId/sessions', createTrailSession)
router.patch('/sessions/:id', updateTrailSession)
router.delete('/sessions/:id', deleteTrailSession)
router.get('/sessions/:id/participants', listTrailSessionParticipants)
router.get('/calendar', getCalendar)
router.get('/reports', getReports)
router.get('/guides', listGuides)
router.post('/guides', createGuide)
router.put('/guides/:cpf', updateGuide)
router.delete('/guides/:cpf', deleteGuide)
router.post('/convites', createInvite)

export default router
