import type { PostStatus } from '@/generated/prisma/enums.js'

export interface IPost {
	id: string
	title: string
	content: string
	thumbnail?: string
	isFeatured: boolean
	status: PostStatus
	tags: string[]
	views: number
	authorId: string
	createdAt: Date
	updatedAt: Date
}

export type ICreatePost = Omit<
	IPost,
	'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'views'
>
