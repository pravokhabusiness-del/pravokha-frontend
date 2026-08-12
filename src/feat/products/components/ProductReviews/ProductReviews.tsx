import { useState, useEffect } from "react";
import { Star, Upload, X, Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";
import { Input } from "@/ui/Input";
import { Card } from "@/ui/Card";
import { apiClient } from "@/infra/api/apiClient";
import { useAuth } from "@/core/context/AuthContext";
import { toast } from "sonner";
import { LoadingSpinner } from "@/shared/ui/LoadingSpinner";
import styles from "./ProductReviews.module.css";
import { cn, getMediaUrl } from "@/lib/utils";
import { InteractiveStarRating } from "@/shared/ui/InteractiveStarRating";

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
    isLoading: boolean;
    onReviewAction?: () => void;
}

interface Review {
    id: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    createdAt: string;
    status: string;
    metadata?: string;
    user?: {
        name: string;
        image?: string;
    }
}

interface CategoryRating {
    name: string;
    rating: number;
}

export const ProductReviews = ({ productId, reviews, isLoading, onReviewAction }: ProductReviewsProps) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [locationState, setLocationState] = useState("Tamil Nadu");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState<string | null>(null);
    const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{
        title?: string;
        reviewText?: string;
        rating?: string;
    }>({});

    const INDIAN_STATES = [
        "Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana",
        "Maharashtra", "Delhi", "Gujarat", "West Bengal", "Punjab",
        "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Other"
    ];

    // New State for Category Ratings
    const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>([]);
    const [reviewCategories, setReviewCategories] = useState<string[]>([]);

    // Fetch product details to get review categories from tags
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await apiClient.get(`/products/${productId}`);
                if (response.data.success) {
                    const product = response.data.data;
                    if (product) {
                        const tags = product.tags || [];
                        const cats = Array.isArray(tags)
                            ? tags.filter((t: string) => t.startsWith("review_cat:"))
                                .map((t: string) => t.replace("review_cat:", ""))
                            : [];

                        if (cats.length > 0) {
                            setReviewCategories(cats);
                            setCategoryRatings(cats.map((c: string) => ({ name: c, rating: 0 })));
                        } else {
                            // Default Categories if none specified
                            const defaults = ["Quality", "Value", "Accuracy"];
                            setReviewCategories(defaults);
                            setCategoryRatings(defaults.map(c => ({ name: c, rating: 0 })));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product for review categories", err);
            }
        };
        fetchProductDetails();
    }, [productId]);

    const handleCategoryRatingChange = (categoryIndex: number, newRating: number) => {
        const updated = [...categoryRatings];
        updated[categoryIndex].rating = newRating;
        setCategoryRatings(updated);
    };

    const validateForm = () => {
        const errors: typeof validationErrors = {};

        if (!rating) {
            errors.rating = "Please select an overall rating";
        }
        if (!title.trim()) {
            errors.title = "Title is required";
        } else if (title.length < 3) {
            errors.title = "Title must be at least 3 characters";
        } else if (title.length > 100) {
            errors.title = "Title must be less than 100 characters";
        }
        if (!reviewText.trim()) {
            errors.reviewText = "Review text is required";
        } else if (reviewText.length < 10) {
            errors.reviewText = "Review must be at least 10 characters";
        } else if (reviewText.length > 1000) {
            errors.reviewText = "Review must be less than 1000 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const invalidFiles = files.filter(file => !validTypes.includes(file.type));

            if (invalidFiles.length > 0) {
                toast.error("Please upload only JPG, PNG, or WebP images");
                return;
            }

            const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);

            if (oversizedFiles.length > 0) {
                toast.error("Each image must be less than 5MB");
                return;
            }

            if (files.length + selectedImages.length + existingImages.length > 3) {
                toast.error("You can upload up to 3 images only");
                return;
            }

            setSelectedImages(prev => [...prev, ...files]);
        }
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async () => {
        if (!user) {
            toast.error("Please sign in to leave a review");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        setIsSubmitting(true);

        try {
            let newlyUploadedUrls: string[] = [];

            if (selectedImages.length > 0) {
                const formData = new FormData();
                selectedImages.forEach(file => formData.append('files', file));

                const uploadRes = await apiClient.post('/uploads/multiple', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data.success) {
                    newlyUploadedUrls = uploadRes.data.urls;
                }
            }

            const finalImageUrls = [...existingImages, ...newlyUploadedUrls];

            const metadata = {
                categoryRatings: categoryRatings.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.rating }), {}),
                locationState: locationState || "Tamil Nadu"
            };

            const reviewData = {
                productId: productId,
                rating,
                title: title.trim(),
                comment: reviewText.trim(),
                images: finalImageUrls,
                metadata: JSON.stringify(metadata)
            };

            if (editingReview) {
                const response = await apiClient.patch(`/reviews/${editingReview}`, reviewData);
                if (response.data.success) {
                    toast.success("Review updated successfully");
                    setEditingReview(null);
                }
            } else {
                const response = await apiClient.post("/reviews", reviewData);
                if (response.data.success) {
                    toast.success("Review submitted successfully");
                }
            }

            setRating(0);
            setTitle("");
            setReviewText("");
            setLocationState("Tamil Nadu");
            setSelectedImages([]);
            setExistingImages([]);
            setValidationErrors({});
            setCategoryRatings(reviewCategories.map(c => ({ name: c, rating: 0 })));

            onReviewAction?.();
        } catch (error: any) {
            console.error("Error submitting review:", error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review.id);
        setRating(review.rating);
        setTitle(review.title);
        setReviewText(review.comment);
        setExistingImages(review.images || []);

        if (review.metadata) {
            try {
                const meta = JSON.parse(review.metadata);
                if (meta.locationState) {
                    setLocationState(meta.locationState);
                }
                if (meta.categoryRatings) {
                    const loadedRatings = Object.entries(meta.categoryRatings).map(([name, rating]) => ({
                        name,
                        rating: Number(rating)
                    }));
                    setCategoryRatings(loadedRatings);
                }
            } catch (e) {
                console.error("Failed to parse review metadata", e);
            }
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const response = await apiClient.delete(`/reviews/${reviewId}`);
            if (response.data.success) {
                toast.success("Review deleted successfully");
                onReviewAction?.();
            }
        } catch (error: any) {
            console.error("Error deleting review:", error);
            toast.error(error.response?.data?.message || "Failed to delete review");
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-8">
            {user && (user.role === "CUSTOMER" || editingReview || ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role || '')) ? (
                <Card className={styles.formCard}>
                    <h3 className={styles.formTitle}>
                        {editingReview ? "Edit Your Review" : "Write a Review"}
                    </h3>

                    <div className={styles.ratingContainer}>
                        <label className={styles.label}>Overall Rating *</label>
                        <InteractiveStarRating
                            rating={rating}
                            onRatingChange={(newRating) => {
                                setRating(newRating);
                                setValidationErrors(prev => ({ ...prev, rating: undefined }));
                            }}
                            size="lg"
                        />
                        {validationErrors.rating && (
                            <p className={styles.error}>{validationErrors.rating}</p>
                        )}
                    </div>

                    {reviewCategories.length > 0 && (
                        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Detailed Ratings</h4>
                            {categoryRatings.map((cat, index) => (
                                <div key={index} className="flex items-center justify-between max-w-xs">
                                    <span className="text-sm">{cat.name}</span>
                                    <InteractiveStarRating
                                        rating={cat.rating}
                                        onRatingChange={(r) => handleCategoryRatingChange(index, r)}
                                        size="sm"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Location / State Selection Field */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Your Location (State)</label>
                        <select
                            value={locationState}
                            onChange={(e) => setLocationState(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Review Title *</label>
                        <Input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setValidationErrors(prev => ({ ...prev, title: undefined }));
                            }}
                            placeholder="Summarize your experience"
                            maxLength={100}
                            className={cn(
                                validationErrors.title && "border-destructive focus-visible:ring-destructive",
                                title && !validationErrors.title && "border-success focus-visible:ring-success"
                            )}
                        />
                        {validationErrors.title && (
                            <p className={styles.error}>{validationErrors.title}</p>
                        )}
                        {title && !validationErrors.title && (
                            <p className={styles.success}>
                                <Check className="h-3 w-3" /> Looks good!
                            </p>
                        )}
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Your Review *</label>
                        <div className={styles.textAreaContainer}>
                            <Textarea
                                value={reviewText}
                                onChange={(e) => {
                                    setReviewText(e.target.value);
                                    setValidationErrors(prev => ({ ...prev, reviewText: undefined }));
                                }}
                                placeholder="Share your thoughts about the product..."
                                rows={5}
                                maxLength={1000}
                                className={cn(
                                    validationErrors.reviewText && "border-destructive focus-visible:ring-destructive",
                                    reviewText && !validationErrors.reviewText && "border-success focus-visible:ring-success"
                                )}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    {validationErrors.reviewText && (
                                        <p className={styles.error}>{validationErrors.reviewText}</p>
                                    )}
                                    {reviewText && !validationErrors.reviewText && (
                                        <p className={styles.success}>
                                            <Check className="h-3 w-3" /> Looks good!
                                        </p>
                                    )}
                                </div>
                                <p className={styles.charCount}>{reviewText.length}/1000</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.imageUploadSection}>
                        <label className={styles.label}>
                            Add Photos (Optional - Max 3, JPG/PNG/WebP, 5MB each)
                        </label>
                        <div className={styles.imageGrid}>
                            {/* Existing Images when Editing */}
                            {existingImages.map((imgUrl, index) => (
                                <div key={`exist-${index}`} className={styles.imagePreview}>
                                    <img
                                        src={getMediaUrl(imgUrl)}
                                        alt={`Existing preview ${index + 1}`}
                                        className={styles.previewImg}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className={styles.removeImgButton}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Newly Selected Image Files */}
                            {selectedImages.map((file, index) => (
                                <div key={`selected-${index}`} className={styles.imagePreview}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                        className={styles.previewImg}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedImage(index)}
                                        className={styles.removeImgButton}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {existingImages.length + selectedImages.length < 3 && (
                                <label className={styles.uploadLabel}>
                                    <Upload className={styles.uploadIcon} />
                                    <span className={styles.uploadText}>Upload</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className={styles.submitActions}>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="w-full md:w-auto"
                        >
                            {isSubmitting ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
                        </Button>
                        {editingReview && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingReview(null);
                                    setRating(0);
                                    setTitle("");
                                    setReviewText("");
                                    setLocationState("Tamil Nadu");
                                    setSelectedImages([]);
                                    setExistingImages([]);
                                    setValidationErrors({});
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </Card>
            ) : user ? (
                <Card className="p-6 text-center border-amber-200/60 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-bold">Logged in as {user.role?.replace('_', ' ')}. Reviews can only be submitted by Customer accounts.</p>
                </Card>
            ) : (
                <Card className="p-6 text-center rounded-2xl">
                    <p className="text-muted-foreground text-sm font-semibold">Please sign in to leave a review</p>
                </Card>
            )}

            <div className={styles.reviewsListSection}>
                <h3 className={styles.reviewsTitle}>Customer Reviews</h3>

                {reviews.length > 0 ? (
                    reviews.map((review) => {
                        let parsedMeta: any = {};
                        try {
                            if (review.metadata) parsedMeta = JSON.parse(review.metadata);
                        } catch (e) {}

                        return (
                            <Card key={review.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <div className="flex flex-col gap-1">
                                        <div className={styles.reviewStars}>
                                            <InteractiveStarRating
                                                rating={review.rating}
                                                readOnly
                                                size="sm"
                                                showQuotes={false}
                                            />
                                        </div>
                                        {parsedMeta.locationState && (
                                            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                                📍 {parsedMeta.locationState}, India
                                            </span>
                                        )}
                                    </div>
                                    {user && (user.id === review.userId || ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role || '')) && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditReview(review)}
                                                title="Edit Review"
                                            >
                                                <Edit className="h-4 w-4 text-primary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteReview(review.id)}
                                                title="Delete Review"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <h4 className={styles.reviewTitle}>{review.title}</h4>
                                <p className={styles.reviewComment}>{review.comment}</p>

                                {parsedMeta.categoryRatings && (
                                    <div className="mt-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-1">
                                        {Object.entries(parsedMeta.categoryRatings).map(([name, rating]) => (
                                            <div key={name} className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground capitalize">{name}</span>
                                                <InteractiveStarRating
                                                    rating={Number(rating)}
                                                    readOnly
                                                    size="sm"
                                                    showQuotes={false}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {review.images && review.images.length > 0 && (
                                    <div className={styles.reviewImages}>
                                        {review.images.map((imageUrl, index) => (
                                            <img
                                                key={index}
                                                src={getMediaUrl(imageUrl)}
                                                alt={`Review image ${index + 1}`}
                                                className={styles.reviewImgThumb}
                                                loading="lazy"
                                                onClick={() => setSelectedModalImage(getMediaUrl(imageUrl))}
                                            />
                                        ))}
                                    </div>
                                )}

                                <p className={styles.reviewDate}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </Card>
                        );
                    })
                ) : (
                    <Card className="p-6 text-center">
                        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                    </Card>
                )}
            </div>

            {selectedModalImage && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setSelectedModalImage(null)}
                >
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button
                            className={styles.modalClose}
                            onClick={() => setSelectedModalImage(null)}
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={selectedModalImage}
                            alt="Full size review"
                            className={styles.modalImage}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
