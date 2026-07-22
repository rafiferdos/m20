import { Role } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { premiumGuard } from '@/middlewares/premiumGuard.js'
import { Router } from 'express'
import { PremiumController } from './premium.controller.js'

const router = Router()

router.get(
	'/',
	auth(Role.ADMIN, Role.USER, Role.AUTHOR),
	premiumGuard(),
	PremiumController.premium
)

export const PremiumRoutes: Router = router
