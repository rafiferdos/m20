import type { PostStatus } from '@/generated/prisma/enums.js'
import type { PostWhereInput } from '@/generated/prisma/models.js'

export interface IPost {
	id: string
	title: string
	content: string
	thumbnail?: string
	isFeatured: boolean
	isPremium?: boolean
	status: PostStatus
	tags: string[]
	views: number
	authorId: string
	createdAt: Date
	updatedAt: Date
}

export interface ICreatePost extends Omit<
	IPost,
	'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'views'
> {}

export interface IUpdatePost extends Partial<
	Omit<IPost, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'views'>
> {}

export interface IPostQueryParams extends PostWhereInput {
	searchTerm?: string
	page?: number
	limit?: number
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}
