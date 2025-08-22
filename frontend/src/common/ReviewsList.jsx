import React from 'react';
import './ReviewsList.css';

const ReviewsList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <p>No reviews yet.</p>;
    }

    return (
        <div className="reviews-list-container">
            <h2>Reviews</h2>
            {reviews.map(review => (
                <div key={review._id} className="review-card">
                    <div className="review-header">
                        <img src={review.reviewer.profileImage} alt={review.reviewer.name} className="reviewer-image" />
                        <div>
                            <p className="reviewer-name">{review.reviewer.name}</p>
                            <p className="review-project">Project: {review.project ? review.project.title : 'N/A'}</p>
                        </div>
                        <div className="review-rating">
                            {[...Array(5)].map((star, index) => (
                                <span key={index} className={index < review.rating ? 'star-filled' : 'star-empty'}>&#9733;</span>
                            ))}
                        </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewsList;