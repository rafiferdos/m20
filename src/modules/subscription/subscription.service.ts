import config from '@/config/index.js'
import { prisma } from '@/lib/prisma.js'
import { stripe } from '@/lib/stripe.js'
import type Stripe from 'stripe'
import {
	handleChangeSubscription,
	handleCheckoutCompleted
} from './subscription.utils.js'

const createSubscriptionSession = async (userId: string) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const user = await tx.user.findUniqueOrThrow({
			where: {
				id: userId
			},
			include: {
				subscription: true
			}
		})
		let stripeCustomerId = user.subscription?.stripeCustomerId
		if (!stripeCustomerId) {
			const customer = await stripe.customers.create({
				email: user.email,
				name: user.name,
				metadata: {
					userId: user.id
				}
			})
			stripeCustomerId = customer.id
		}

		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: config.stripe_price_id,
					quantity: 1
				}
			],
			mode: 'subscription',
			customer: stripeCustomerId,
			payment_method_types: ['card'],
			success_url: `${config.app_url}/premium?success=true`,
			cancel_url: `${config.app_url}/subscription?success=false`,
			metadata: {
				userId: user.id
			}
		})
		return session.url
	})
	return {
		paymentUrl: transactionResult
	}
}

const stripeWebhookHandler = async (payload: Buffer, sig: string) => {
	const endPointSecret = config.stripe_webhook_secret
	const event = stripe.webhooks.constructEvent(payload, sig, endPointSecret)

	//handle the event
	switch (event.type) {
		case 'checkout.session.completed':
			const session = event.data.object as Stripe.Checkout.Session
			await handleCheckoutCompleted(session)

			break

		case 'customer.subscription.updated':
			const subscription = event.data.object
			await handleChangeSubscription(subscription)
			break

		case 'customer.subscription.deleted':
			try {
				const deletedSubscription = event.data.object as Stripe.Subscription
				await handleChangeSubscription(deletedSubscription)
			} catch (error) {
				console.error('Error in deleted subscription handler:', error)
			}
			break

		default:
			console.log(`Unhandled event type ${event.type}`)
	}
}

const getSubscriptionStatusFromDB = async (userId: string) => {
	const isSubscriptionExists = await prisma.subscription.findUniqueOrThrow({
		where: {
			userId
		}
	})
	const isActive =
		isSubscriptionExists.subscriptionStatus === 'ACTIVE' &&
		isSubscriptionExists.currentPeriodEnd &&
		new Date(isSubscriptionExists.currentPeriodEnd) > new Date()
	return {
		status: isSubscriptionExists.subscriptionStatus,
		isSubscribed: isActive,
		currentPeriodEnd: isSubscriptionExists.currentPeriodEnd
	}
}

export const SubscriptionService = {
	create: createSubscriptionSession,
	webhook: stripeWebhookHandler,
	getStatus: getSubscriptionStatusFromDB
}
