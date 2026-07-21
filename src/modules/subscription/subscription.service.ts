import config from '@/config/index.js'
import { prisma } from '@/lib/prisma.js'
import { stripe } from '@/lib/stripe.js'

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

export const SubscriptionService = { create: createSubscriptionSession }
