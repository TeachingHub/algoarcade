import { useState } from "react";
import { createPost, updatePost, slugify } from "@/services/blogService";
import type { BlogPost } from "@/types/blog/post";
import styles from "@/styles/pages/admin/AdminDashboard.module.css";
import formStyles from "@/styles/pages/admin/CreatePostForm.module.css";
import Button from "@/components/shared/Button";

interface CreatePostFormProps {
    postToEdit?: BlogPost;
    onPostCreated: () => void;
    onCancel: () => void;
}

export default function CreatePostForm({ postToEdit, onPostCreated, onCancel }: CreatePostFormProps) {
    const isEditing = !!postToEdit;

    const [title, setTitle] = useState(postToEdit?.title || "");
    const [slug, setSlug] = useState(postToEdit?.slug || "");
    const [excerpt, setExcerpt] = useState(postToEdit?.excerpt || "");
    const [content, setContent] = useState(postToEdit?.content || "");
    const [author, setAuthor] = useState(postToEdit?.author || "AlgoArcade");
    const [tags, setTags] = useState(postToEdit?.tags?.join(", ") || "");
    const [coverImage, setCoverImage] = useState(postToEdit?.coverImage || "");
    const [published, setPublished] = useState(postToEdit?.published ?? true);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoSlug, setAutoSlug] = useState(!postToEdit);

    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (autoSlug) {
            setSlug(slugify(value));
        }
    };

    const handleSlugChange = (value: string) => {
        setAutoSlug(false);
        setSlug(slugify(value));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure file is less than ~800KB (Firestore max doc size is 1MB, so image should be smaller)
        if (file.size > 800 * 1024) {
            setError("Image size must be less than 800KB due to database limits (Base64).");
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Title is required.");
        if (!slug.trim()) return setError("Slug is required.");
        if (!excerpt.trim()) return setError("Excerpt is required.");
        if (!content.trim()) return setError("Content is required.");

        setIsSubmitting(true);

        try {
            const parsedTags = tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            const postData = {
                title: title.trim(),
                slug: slug.trim(),
                excerpt: excerpt.trim(),
                content: content.trim(),
                author: author.trim() || "AlgoArcade",
                tags: parsedTags,
                coverImage: coverImage.trim(),
                published,
            };

            if (isEditing && postToEdit) {
                await updatePost(postToEdit.id, postData);
            } else {
                await createPost(postData);
            }

            onPostCreated();
        } catch (err: any) {
            console.error("Error saving post:", err);
            setError(err.message || "Failed to save post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{'>'} {isEditing ? "EDIT POST_" : "CREATE NEW POST_"}</h2>
                <Button style={["secondary"]} label="CANCEL" onClick={onCancel} />
            </div>

            <form className={formStyles.form} onSubmit={handleSubmit}>
                {error && <div className={formStyles.error}>{error}</div>}

                <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="post-title">TITLE</label>
                    <input
                        id="post-title"
                        className={formStyles.input}
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="My Awesome Algorithm Post"
                        maxLength={200}
                    />
                </div>

                <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="post-slug">SLUG</label>
                    <input
                        id="post-slug"
                        className={formStyles.input}
                        type="text"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="my-awesome-algorithm-post"
                        maxLength={200}
                    />
                    <span className={formStyles.hint}>URL: /blog/{slug || "..."}</span>
                </div>

                <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="post-excerpt">EXCERPT</label>
                    <textarea
                        id="post-excerpt"
                        className={formStyles.textarea}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="A short summary that appears in the blog list..."
                        rows={2}
                        maxLength={500}
                    />
                </div>

                <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="post-content">CONTENT (MARKDOWN)</label>
                    <textarea
                        id="post-content"
                        className={`${formStyles.textarea} ${formStyles.contentArea}`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="## Introduction\n\nWrite your post in Markdown format..."
                        rows={12}
                    />
                </div>

                <div className={formStyles.row}>
                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="post-author">AUTHOR</label>
                        <input
                            id="post-author"
                            className={formStyles.input}
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="AlgoArcade"
                            maxLength={100}
                        />
                    </div>

                    <div className={formStyles.field}>
                        <label className={formStyles.label} htmlFor="post-tags">TAGS (COMMA SEPARATED)</label>
                        <input
                            id="post-tags"
                            className={formStyles.input}
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Algorithm, TSP, Tutorial"
                            maxLength={200}
                        />
                    </div>
                </div>

                <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="post-cover">COVER IMAGE (BASE64 ENCODED)</label>
                    <input
                        id="post-cover"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={formStyles.input}
                        style={{ padding: '8px' }}
                    />
                    {coverImage && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <img src={coverImage} alt="Cover Preview" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            <button type="button" onClick={() => setCoverImage("")} style={{ color: 'var(--destructive)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>[ REMOVE ]</button>
                        </div>
                    )}
                </div>

                <div className={formStyles.checkboxField}>
                    <label className={formStyles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className={formStyles.checkbox}
                        />
                        <span>PUBLISH {isEditing ? "STATUS" : "IMMEDIATELY"}</span>
                    </label>
                </div>

                <div className={formStyles.submitRow}>
                    <Button
                        style={["primary"]}
                        label={isSubmitting ? "SAVING..." : (isEditing ? "SAVE CHANGES" : "CREATE POST")}
                        type="submit"
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
}
