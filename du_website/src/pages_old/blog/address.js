import AccountLayout from '@/components/dashboard/AccountLayout';
import Layout from '@/components/Layout/Layout';

const Address = () => {
    return (
        <Layout>
            <AccountLayout title="Address" subTitle="You have full control to manage your own Account.">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="address-block bg-light rounded p-3">
                                    <a href="" className="edit_address" data-toggle="modal" data-dismiss="modal"
                                        data-target="#address_model">
                                        <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                    </a>
                                    <a href="" className="delete_address">
                                        <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                                    </a>
                                    <h6>My Home Address</h6>
                                    <p className="text-muted">1234567890</p>
                                    <span className="text-muted">Chayan para, pal para, Ghogomali, Siliguri,
                                        West Bengal - 734006</span>
                                </div>
                            </div>
                            <div className="col-lg-6"></div>
                        </div>
                    </div>
                </div>
            </AccountLayout>
        </Layout>
    )
}

export default Address