import Image from "next/image"
import Link from "next/link"

const BrandItem = ({ image, name, url }) => {
    return (
        <>
            <div className="product-brand">
                <Link href={url} className="product-img">
                    <Image src={image} alt={name} height={300} width={300} />
                </Link>
                <Link href={url} className="product-info">
                    {name}
                </Link>
            </div>
        </>
    )
}

export default BrandItem