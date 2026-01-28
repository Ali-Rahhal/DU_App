import Image from 'next/image'
import Link from 'next/link'

const HomePageOffers = ({ offers }) => {


    return (
        <>
            <div className="pt-4 pt-md-5">
                <div className="offers-list bg-light py-5 offers-grid-2">
                    <div className="container">
                        <ul>
                            {
                                offers?.map((item, index) =>
                                    <li key={index + item.image}>
                                        <div className="offer-image">
                                            <Image src={item.image} alt={item.title} width={500} height={300} />
                                        </div>
                                        <div className="offer-info">
                                            <h2 className="offer-title">
                                                {item.title}
                                            </h2>
                                            <p className="offer-subtitle">
                                                {item.subTitle}
                                            </p>
                                            <Link href={item.url ? item.url : ''} className="btn btn-primary btn-sm">Shop now</Link>
                                        </div>
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePageOffers