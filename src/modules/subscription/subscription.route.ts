import { Role } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { SubscriptionController } from './subscription.controller.js'

const router = Router()

router.post(
	'/checkout',
	auth(Role.ADMIN, Role.USER, Role.AUTHOR),
	SubscriptionController.checkout
)

export const SubscriptionRoute: Router = router
