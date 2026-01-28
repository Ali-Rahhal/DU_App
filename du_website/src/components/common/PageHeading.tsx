
const PageHeading = ({ title, subtitle, image, color = "dark", overlay = "6" }) => {
    return (
        <>
            <section className="py-5 py-md-8 overlay background-center text-white"
                data-overlay={overlay}
                data-overlay-color={color}
                style={{ backgroundImage: `url(${image})` }}
            >
                <div className="container">
                    <div className="header-align text-center">
                        {title && <h1 className="h1 mb-1">{title}</h1>}
                        {subtitle && <span>{subtitle}</span>}
                    </div>
                </div>
            </section>
        </>
    )
}

export default PageHeading