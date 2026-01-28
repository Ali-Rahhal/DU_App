import Image from "next/image"
import Link from "next/link"

const CategoryItem = ({ image, name, url }) => {
    return (
        <>
            <div className="product-categories-grid">
                <div className="product-img">
                    <Image src={image} alt={name} height={300} width={300} />
                    <div className="cat-info">
                        <h5 className="cat-name">
                            {name}
                        </h5>
                        <Link href={url ? url : ''} className="cat-link">
                            View All <i className="ti-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CategoryItem