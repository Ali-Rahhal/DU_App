
import CartSummary from '@/components/common/CartSummary';
import Layout from '@/components/Layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import Accordion from 'react-bootstrap/Accordion';
import { useSelector } from 'react-redux';

const Checkout = () => {
    const { cart } = useSelector((state) => state.cart);
    return (
        <Layout>
            <section className="section-padding mt-5">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-md-9">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row pb-4">
                                        <div className="col-sm-6">
                                            <div className="form-group mb-4">
                                                <label className="form-label">First name <span className='text-danger'>*</span></label>
                                                <input className="form-control" type="text" value="Jhon" />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group mb-4">
                                                <label className="form-label">Last name <span className='text-danger'>*</span></label>
                                                <input className="form-control" type="text" value="Doe" />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group mb-4">
                                                <label className="form-label">Email address <span
                                                    className='text-danger'>*</span></label>
                                                <input className="form-control" type="email" value="jhon@doe.com" />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group mb-4">
                                                <label className="form-label">Company</label>
                                                <input className="form-control" type="text" value="Dsahathemes" />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group mb-4">
                                                <label className="form-label">Country <span className='text-danger'>*</span></label>
                                                <select className="form-control">
                                                    <option value>Select country</option>
                                                    <option value="Argentina">Argentina</option>
                                                    <option value="Belgium">Belgium</option>
                                                    <option value="France">France</option>
                                                    <option value="India" selected>India</option>
                                                    <option value="Germany">Germany</option>
                                                    <option value="Spain">Spain</option>
                                                    <option value="UK">United Kingdom</option>
                                                    <option value="USA">USA</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <Accordion defaultActiveKey="0">
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Pay with Credit Card</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="accordion-content-inner">
                                                    <p className="py-4">We accept following credit cards:&nbsp;&nbsp;
                                                        <Image height={28} width={187} className="d-inline-block align-middle" src="/assets/img/payment-methods.png" alt="Cerdit Cards" />
                                                    </p>
                                                    <form className="credit-card-form row g-3">
                                                        <div className="col-sm-6 mb-4">
                                                            <input className="form-control" type="text"
                                                                name="number" placeholder="Card Number" required="" />
                                                        </div>
                                                        <div className="col-sm-6 mb-4">
                                                            <input className="form-control" type="text" name="name"
                                                                placeholder="Full Name" required="" />
                                                        </div>
                                                        <div className="col-sm-3 mb-4">
                                                            <input className="form-control" type="text"
                                                                name="expiry" placeholder="MM/YY" required="" />
                                                        </div>
                                                        <div className="col-sm-3 mb-4">
                                                            <input className="form-control" type="text" name="cvc"
                                                                placeholder="CVC" required="" />
                                                        </div>
                                                        <div className="col-sm-6 mb-4">
                                                            <Link href="/thak-you" className="btn btn-primary d-block w-100">Place
                                                                order</Link>
                                                        </div>
                                                    </form>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Pay with PayPal</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="accordion-content-inner">
                                                    <p className="pt-4 mb-0 pb-2"><span className="font-weight-bold">PayPal</span> - the safer, easier way to pay</p>
                                                    <Link href="/thak-you" className="btn btn-primary">Checkout with PayPal</Link>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>Pay later</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="accordion-content-inner">
                                                    <p className="pt-4 mb-0 pb-3"><span className="font-weight-bold">Cash On Delevary</span> -Buy Now Pay Later for all your shopping</p>
                                                    <Link href="/thak-you" className="btn btn-primary">Place order</Link>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 mt-lg-0 mt-6">
                            <h6 className="font-weight-bold">Deliver to</h6>
                            <div className="mb-4">
                                <select className="form-control">
                                    <option value="s">Siliguri - 734001</option>
                                    <option value="s" selected>Delhi - 110002</option>
                                    <option value="s">Kolkata - 700027</option>
                                </select>
                            </div>
                            <CartSummary cart={cart} />
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default Checkout