import { Fragment } from "react";

const StarRating = ({ value }) => {
    return (
        <>
            {[...Array(5)].map((star, index) => {
                return (
                    <Fragment key={index}>
                        {(index + 1) <= value ? <i className="fa fa-star"></i> : <i className="fa fa-star-o"></i>}
                    </Fragment>
                );
            })}
        </>
    );
};

export default StarRating