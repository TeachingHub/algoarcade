import { collection, doc, getDocs, query, where, orderBy, addDoc, deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { BlogPost } from "@/types/blog/post";

const COLLECTION_NAME = "blog_posts";

/**
 * Format timestamp to string date
 */
export function formatDate(timestamp: any, format: "short" | "long" = "short"): string {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: format === "long" ? "long" : "short",
        day: "numeric",
    });
}

/**
 * Estimate reading time based on content words
 */
export function estimateReadTime(content: string): number {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Slugify a string for URLs
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Basic sanitization: strip <script> tags and on* event attributes.
 * For Markdown content this prevents stored XSS.
 */
function sanitize(input: string): string {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
}

/**
 * Validate slug format: lowercase, hyphens, alphanumeric only
 */
function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Fetch all published blog posts, ordered by date (newest first)
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
    try {
        const postsRef = collection(db, COLLECTION_NAME);
        const q = query(
            postsRef,
            where("published", "==", true),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as BlogPost[];
    } catch (error) {
        console.error("Error fetching published posts:", error);
        return [];
    }
}

/**
 * Fetch ALL blog posts (including unpublished) — for admin use
 */
export async function getAllPosts(): Promise<BlogPost[]> {
    try {
        const postsRef = collection(db, COLLECTION_NAME);
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as BlogPost[];
    } catch (error) {
        console.error("Error fetching all posts:", error);
        return [];
    }
}

/**
 * Fetch a single blog post by its slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const postsRef = collection(db, COLLECTION_NAME);
        const q = query(postsRef, where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    } catch (error) {
        console.error("Error fetching post by slug:", error);
        return null;
    }
}

/**
 * Create a new blog post with input sanitization
 */
export async function createPost(post: Omit<BlogPost, "id" | "createdAt">): Promise<string> {
    if (!isValidSlug(post.slug)) {
        throw new Error("Invalid slug format. Use only lowercase letters, numbers, and hyphens.");
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        title: sanitize(post.title),
        slug: post.slug.trim().toLowerCase(),
        excerpt: sanitize(post.excerpt),
        content: sanitize(post.content),
        author: sanitize(post.author),
        tags: post.tags.map((t) => sanitize(t)),
        coverImage: sanitize(post.coverImage),
        published: !!post.published,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Update an existing blog post with input sanitization
 */
export async function updatePost(postId: string, data: Partial<Omit<BlogPost, "id" | "createdAt">>): Promise<void> {
    const sanitizedData: Record<string, unknown> = {};

    if (data.title !== undefined) sanitizedData.title = sanitize(data.title);
    if (data.slug !== undefined) {
        if (!isValidSlug(data.slug)) throw new Error("Invalid slug format.");
        sanitizedData.slug = data.slug.trim().toLowerCase();
    }
    if (data.excerpt !== undefined) sanitizedData.excerpt = sanitize(data.excerpt);
    if (data.content !== undefined) sanitizedData.content = sanitize(data.content);
    if (data.author !== undefined) sanitizedData.author = sanitize(data.author);
    if (data.tags !== undefined) sanitizedData.tags = data.tags.map((t) => sanitize(t));
    if (data.coverImage !== undefined) sanitizedData.coverImage = sanitize(data.coverImage);
    if (data.published !== undefined) sanitizedData.published = !!data.published;

    const postRef = doc(db, COLLECTION_NAME, postId);
    await updateDoc(postRef, {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a blog post by ID
 */
export async function deletePost(postId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, postId));
}

/**
 * Toggle the published status of a post
 */
export async function togglePostPublished(postId: string, currentStatus: boolean): Promise<void> {
    const postRef = doc(db, COLLECTION_NAME, postId);
    await updateDoc(postRef, {
        published: !currentStatus,
        updatedAt: serverTimestamp(),
    });
}
