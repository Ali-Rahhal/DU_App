import StarRating from "./StarRating";

const ReviewItem = ({ rating, date, title, description }) => {
    return (
        <>
            <div className="review_content">
                <div className="mb-1">
                    <div className="rating">
                        <StarRating value={rating} />
                    </div>
                    <em>{date}</em>
                </div>
                <h4>&quot;{title}&quot;</h4>
                <p>{description} </p>
            </div>
        </>
    );
};

export default ReviewItem