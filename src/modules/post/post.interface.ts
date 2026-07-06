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

export enum PostStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	ARCHIVED = 'ARCHIVED'
}
