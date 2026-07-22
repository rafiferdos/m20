import { SubscriptionStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { stripe } from '@/lib/stripe.js'
import type Stripe from 'stripe'

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
	const userId = session.metadata?.userId
	const stripeCustomerId = session.customer
	const stripeSubscriptionId = session.subscription

	if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
		// throw new AppError(
		// 	status.BAD_REQUEST,
		// 	'Missing required information in the webhook event'
		// )
		console.log('Missing required information in the webhook event:', {
			userId,
			stripeCustomerId,
			stripeSubscriptionId
		})
		return
	}
	const stripeSubscription = await stripe.subscriptions.retrieve(
		stripeSubscriptionId as string
	)
	const currentPeriodEnd = stripeSubscription.items.data[0]?.current_period_end
	const inMiliSeconds = currentPeriodEnd ? currentPeriodEnd * 1000 : null
	const currentPeriodEndDate = inMiliSeconds ? new Date(inMiliSeconds) : null
	await prisma.subscription.upsert({
		where: {
			userId
		},
		update: {
			stripeCustomerId: stripeCustomerId as string,
			stripeSubscriptionId: stripeSubscriptionId as string,
			currentPeriodEnd: currentPeriodEndDate as Date,
			subscriptionStatus: 'ACTIVE'
		},
		create: {
			userId: userId,
			stripeCustomerId: stripeCustomerId as string,
			stripeSubscriptionId: stripeSubscriptionId as string,
			currentPeriodEnd: currentPeriodEndDate as Date,
			subscriptionStatus: 'ACTIVE'
		}
	})
}

const handleChangeSubscription = async (subscription: Stripe.Subscription) => {
	const stripeSubscriptionId = subscription.id
	const subscriptionStatus =
		subscription.status === 'active' ? SubscriptionStatus.ACTIVE
		: subscription.status === 'trialing' ? SubscriptionStatus.ACTIVE
		: subscription.status === 'canceled' ? SubscriptionStatus.CANCELED
		: SubscriptionStatus.EXPIRED
	const currentPeriodEnd = subscription.items.data?.[0]?.current_period_end
	const inMiliSeconds = currentPeriodEnd ? currentPeriodEnd * 1000 : null
	const currentPeriodEndDate = inMiliSeconds ? new Date(inMiliSeconds) : null

	const isSubscriptionExists = await prisma.subscription.findUniqueOrThrow({
		where: {
			stripeSubscriptionId
		}
	})
	if (!isSubscriptionExists) {
		console.log(
			'Subscription not found for stripeSubscriptionId:',
			stripeSubscriptionId
		)
		return
	}
	await prisma.subscription.update({
		where: {
			stripeSubscriptionId
		},
		data: {
			subscriptionStatus,
			currentPeriodEndDate
		}
	})
}

export { handleChangeSubscription, handleCheckoutCompleted }
