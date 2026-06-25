import { Router } from 'express';
import {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  patchHackathon,
  deleteHackathon,
  getPublicShowcase,
} from '../controllers/hackathon.controller';
import { getDashboardMetrics } from '../controllers/metrics.controller';
import { protect } from '../middleware/auth.middleware';
import {
  validateBody,
  CreateHackathonValidationSchema,
  UpdateHackathonValidationSchema,
} from '../middleware/validationMiddleware';

const router = Router();

// GET public portfolio concluded hackathons (Unprotected)
router.get('/public', getPublicShowcase);

// Lock down all internal dashboard endpoints below
router.use(protect);

// GET aggregated dashboard metrics (Protected)
router.get('/metrics/dashboard', getDashboardMetrics);

// GET all hackathon campaigns
router.get('/', getAllHackathons);

// GET a specific hackathon campaign by ID
router.get('/:id', getHackathonById);

// CREATE a new hackathon campaign
router.post('/', validateBody(CreateHackathonValidationSchema), createHackathon);

// UPDATE a hackathon campaign completely (PUT support)
router.put('/:id', validateBody(UpdateHackathonValidationSchema), updateHackathon);

// PATCH a hackathon campaign partially (supports nested round updates)
router.patch('/:id', validateBody(UpdateHackathonValidationSchema), patchHackathon);

// DELETE a hackathon campaign by ID
router.delete('/:id', deleteHackathon);

export default router;
