import Layout from '@/components/Layout/Layout';
import Image from 'next/image';

const ThankYou = () => {
    return (
        <Layout>
            <section className="pt-4">
                <div className="container">
                    <div className="row align-items-center mt-0 mt-md-4">
                        <div className="col-sm-6 mb-4 mb-lg-0">
                            <div className="thank mb-3">
                                <span className="thank-title-top">Order placed</span>
                                <h2 className="thank-title text-dark ">Successfully</h2>
                                <p className="thank-desc">Lorem ipsum dolor sit amet, consectetur adipisicing elit. In, non.</p>
                            </div>
                            <a href="orders-details" className="btn btn-primary btn-medium rounded">
                                <i className="ti-angle-left"></i> Track Your Order </a>
                        </div>
                        <div className="col-md-5 d-lg-block d-none offset-lg-1 text-md-center">
                            <Image height={445} width={445} className="img-fluid" src="/assets/img/thank.png" alt="thank" />
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default ThankYou