import Image from "next/image"
import Link from "next/link"
import Slider from "react-slick"

const BlogItem = ({ postData }) => {
    let setting = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        className: "slider"
    }

    return (
        <>
            {postData?.post_type === 'sticky' ? <div className="col-lg-6">
                <article className="default-post-wrapper sticky">
                    <div className="post-content">
                        <h4 className="mb-0">
                            <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                {postData?.title}
                            </Link>
                        </h4>
                        <div className="post-meta mb-3">
                            <span className="posted-on">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-calendar"></i>
                                    {postData?.date}
                                </Link>
                            </span>
                            <span className="author">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-user"></i>
                                    {postData?.author}
                                </Link>
                            </span>
                            <span className="comments-link">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-comment-alt"></i>
                                    0 Comments
                                </Link>
                            </span>
                        </div>
                        <div className="post-exarpt mb-3">
                            {postData?.excerpt}
                        </div>
                        <div className="d-flex justify-content-between">
                            <Link className="text-dark" href={"/blog/" + postData?.slug}>
                                <span>Read More</span>
                                <i className="ti-angle-right small"></i>
                            </Link>
                            <div className="popup-share">
                                <i className="ti-share"></i>
                                <span className="share">Share</span>
                                <div className="share-links">
                                    <a className="sharing_button" href="#">
                                        <i className="ti-facebook"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-twitter"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-instagram"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div> : null}
            {postData?.post_type === 'quote' ? <div className="col-lg-6">
                <article className="default-post-wrapper format-quote">
                    <div className="post-content">
                        <h4 className="mb-0">
                            <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                {postData?.title}
                            </Link>
                        </h4>
                        <div className="post-meta mb-3">
                            <span className="posted-on">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-calendar"></i>
                                    {postData?.date}
                                </Link>
                            </span>
                            <span className="author">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-user"></i>
                                    {postData?.author}
                                </Link>
                            </span>
                            <span className="comments-link">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-comment-alt"></i>
                                    0 Comments
                                </Link>
                            </span>
                        </div>
                        <div className="post-exarpt mb-3">
                            {postData?.excerpt}
                        </div>
                        <div className="d-flex justify-content-between">
                            <Link className="text-white" href={"/blog/" + postData?.slug}>
                                <span>Read More</span>
                                <i className="ti-angle-right small"></i>
                            </Link>
                            <div className="popup-share">
                                <i className="ti-share"></i>
                                <span className="share">Share</span>
                                <div className="share-links">
                                    <a className="sharing_button" href="#">
                                        <i className="ti-facebook"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-twitter"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-instagram"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div> : null}
            {postData?.post_type === 'default' ? <div className="col-lg-6">
                <article className="default-post-wrapper format-standard">
                    {postData?.image ? <div className="post-header">
                        <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                            <Image className="img-fluid rounded mb-2" src={postData?.image} alt="BLog-post" width={540} height={304} />
                        </Link>
                    </div> : null}
                    <div className="post-content">
                        <h4 className="mb-0">
                            <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                {postData?.title}
                            </Link>
                        </h4>
                        <div className="post-meta mb-3">
                            <span className="posted-on">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-calendar"></i>
                                    {postData?.date}
                                </Link>
                            </span>
                            <span className="author">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-user"></i>
                                    {postData?.author}
                                </Link>
                            </span>
                            <span className="comments-link">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-comment-alt"></i>
                                    0 Comments
                                </Link>
                            </span>
                        </div>
                        <div className="post-exarpt mb-3">
                            {postData?.excerpt}
                        </div>
                        <div className="d-flex justify-content-between">
                            <Link className="text-dark" href={"/blog/" + postData?.slug}>
                                <span>Read More</span>
                                <i className="ti-angle-right small"></i>
                            </Link>
                            <div className="popup-share">
                                <i className="ti-share"></i>
                                <span className="share">Share</span>
                                <div className="share-links">
                                    <a className="sharing_button" href="#">
                                        <i className="ti-facebook"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-twitter"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-instagram"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div> : null}
            {postData?.post_type === 'gallery' ? <div className="col-lg-6">
                <article className="default-post-wrapper format-gallery">
                    <Slider {...setting} className="post-header slider">
                        {
                            postData?.gallery?.map((item, index) =>
                                <Link href={"/blog/" + postData?.slug} key={index}>
                                    <Image src={item} alt="slider" width={540} height={304} />
                                </Link>
                            )
                        }
                    </Slider>

                    <div className="post-content">
                        <h4 className="mb-0">
                            <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                {postData?.title}
                            </Link>
                        </h4>
                        <div className="post-meta mb-3">
                            <span className="posted-on">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-calendar"></i>
                                    {postData?.date}
                                </Link>
                            </span>
                            <span className="author">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-user"></i>
                                    {postData?.author}
                                </Link>
                            </span>
                            <span className="comments-link">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-comment-alt"></i>
                                    0 Comments
                                </Link>
                            </span>
                        </div>
                        <div className="post-exarpt mb-3">
                            {postData?.excerpt}
                        </div>
                        <div className="d-flex justify-content-between">
                            <Link className="text-dark" href={"/blog/" + postData?.slug}>
                                <span>Read More</span>
                                <i className="ti-angle-right small"></i>
                            </Link>
                            <div className="popup-share">
                                <i className="ti-share"></i>
                                <span className="share">Share</span>
                                <div className="share-links">
                                    <a className="sharing_button" href="#">
                                        <i className="ti-facebook"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-twitter"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-instagram"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div> : null}
            {postData?.post_type === 'image' ? <div className="col-lg-6">
                <article className="default-post-wrapper format-image"
                    style={{ backgroundImage: `url(${postData?.image})` }}>
                    <div className="post-content">
                        <h4 className="mb-0">
                            <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                {postData?.title}
                            </Link>
                        </h4>
                        <div className="post-meta mb-3">
                            <span className="posted-on">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-calendar"></i>
                                    {postData?.date}
                                </Link>
                            </span>
                            <span className="author">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-user"></i>
                                    {postData?.author}
                                </Link>
                            </span>
                            <span className="comments-link">
                                <Link className="post-thumbnail" href={"/blog/" + postData?.slug}>
                                    <i className="ti-comment-alt"></i>
                                    0 Comments
                                </Link>
                            </span>
                        </div>
                        <div className="post-exarpt mb-3">
                            {postData?.excerpt}
                        </div>
                        <div className="d-flex justify-content-between">
                            <Link className="text-white" href={"/blog/" + postData?.slug}>
                                <span>Read More</span>
                                <i className="ti-angle-right small"></i>
                            </Link>
                            <div className="popup-share">
                                <i className="ti-share"></i>
                                <span className="share">Share</span>
                                <div className="share-links">
                                    <a className="sharing_button" href="#">
                                        <i className="ti-facebook"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-twitter"></i>
                                    </a>
                                    <a className="sharing_button" href="#">
                                        <i className="ti-instagram"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div> : null}
        </>
    )
}

export default BlogItem