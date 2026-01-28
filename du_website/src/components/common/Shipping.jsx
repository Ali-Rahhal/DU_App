
const Shipping = () => {
    return (
        <>
            <div className="heading_s1 mb-3">
                <h5 className="font-weight-bold">Calculate Shipping</h5>
            </div>
            <p className="mt-15 mb-30">
                Flat rate: &nbsp;
                <span className="font-weight-bold text-danger">
                    5%
                </span>
            </p>
            <form className="field_form shipping_calculator">
                <div className="form-row">
                    <div className="form-group col-lg-12">
                        <div className="custom_select">
                            <select className="form-control select-active">
                                <option value="">
                                    Choose a
                                    option...
                                </option>
                                <option value="In">
                                    India
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="form-row row">
                    <div className="form-group col-lg-6">
                        <input
                            className="form-control"
                            required="required"
                            placeholder="State / Country"
                            name="name"
                            type="text"
                        />
                    </div>
                    <div className="form-group col-lg-6">
                        <input
                            className="form-control"
                            required="required"
                            placeholder="PostCode / ZIP"
                            name="name"
                            type="text"
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-lg-12">
                        <button className="btn btn-primary btn-rounded btn-full btn-large">
                            Update <i className="ti-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default Shipping