export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    tags: string[];
    coverImage: string;
    published: boolean;
    createdAt: any;
    updatedAt?: any;
}
