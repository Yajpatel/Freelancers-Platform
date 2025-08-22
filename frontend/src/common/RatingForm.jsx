import React, { useState } from 'react';
import axios from 'axios';
import './RatingForm.css';

const RatingForm = ({ projectId, reviewerId, revieweeId, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`http://localhost:8000/project/${projectId}/review`, {
                rating,
                comment,
                reviewerId,
                revieweeId
            });
            setSuccess('Review submitted successfully!');
            if (onReviewSubmit) {
                onReviewSubmit();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rating-form-container">
            <h3>Leave a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="star-rating">
                    {[...Array(5)].map((star, index) => {
                        index += 1;
                        return (
                            <button
                                type="button"
                                key={index}
                                className={index <= rating ? "on" : "off"}
                                onClick={() => setRating(index)}
                            >
                                <span className="star">&#9733;</span>
                            </button>
                        );
                    })}
                </div>
                <textarea
                    placeholder="Leave a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default RatingForm;