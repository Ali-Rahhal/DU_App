import PageHeading from "@/components/common/PageHeading"
import Layout from "@/components/Layout/Layout"

const about = () => {
    return (
        <>
            <Layout>
                <PageHeading 
                title="Building better teams" 
                subtitle="An opportunity to introduce the major benefits of your product and set the scene for what's to come"
                image="/assets/img/extra/page-about.jpg"
                />
                <section className="pt-5">
                    <div className="container">
                        <h2 className="mb-3">Know About our Company.</h2>
                        <div className="row">
                            <div className="col-lg-7 col-md-6">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="m-b20 m-t10">
                                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita ipsa molestias
                                                qui
                                                perspiciatis
                                                consectetur voluptas ratione quas optio natus
                                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos mollitia
                                                architecto voluptatum. Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <ul className="list list-icon mb-lg-0">
                                            <li>  Lorem ipsum
                                                dolor sit amet</li>
                                            <li>
                                                consectetuer
                                                adipiscing elit. Aenean</li>
                                            <li>  commodo
                                                ligula
                                                eget dolor. Aenean</li>
                                        </ul>
                                    </div>
                                    <div className="col-sm-6">
                                        <ul className="list list-icon mb-lg-0">
                                            <li>  Lorem ipsum
                                                dolor sit amet</li>
                                            <li>
                                                consectetuer
                                                adipiscing elit. Aenean</li>
                                            <li>  commodo
                                                ligula
                                                eget dolor. Aenean</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5">
                                <div className="feature-box icon-left mb-3">
                                    <div className="icon-box-info">
                                        <h5>01. Discussion</h5>
                                        <p>Lorem ipsum dolor sit amet consectetur adi pisicing elit. Id, quas?
                                            Ratione magnam
                                            pariatur consequuturn.
                                        </p>
                                    </div>
                                </div>
                                <div className="feature-box icon-left">
                                    <div className="icon-box-info mb-lg-0">
                                        <h5>02. Making</h5>
                                        <p className=" mb-lg-0">Lorem ipsum dolor sit amet consectetur adi pisicing elit. Id, quas?
                                            Ratione magnam
                                            pariatur consequuturn.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    )
}

export default about