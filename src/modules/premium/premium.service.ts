import { prisma } from '@/lib/prisma.js'

const getPremiumContentsFromDB = async () => {
	const post = await prisma.post.findMany({
		where: {
			isPremium: true
		}
  })
  return post
}

export const PremiumService = {
	premiumContent: getPremiumContentsFromDB
}
