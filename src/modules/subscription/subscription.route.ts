import { Router } from 'express'
import { SubscriptionController } from './subscription.controller.js'

const router = Router()

router.post('/checkout', SubscriptionController.checkout)

export const SubscriptionRoute: Router = router
