import Layout from '@/components/Layout/Layout';

const UploadPrescription = () => {
    return (
        <Layout>
            <section className="pt-md-8 pt-4">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 mb-5 mb-md-0">
                            <div className="border p-4 upload_prescription">
                                <form method="post" enctype="multipart/form-data" className="ng-pristine ng-valid">
                                    <div className="form-group">
                                        <label><strong>Upload Prescription</strong></label>
                                        <p className="mb-3"><small>Please attach a prescription to proceed</small></p>
                                        <div className="custom-file">
                                            <input type="text" name="files[]" multiple=""
                                                className="custom-file-input form-control" id="customFile" />
                                            <label className="custom-file-label" for="customFile">Choose file</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <button type="button" name="upload" value="upload" id="upload"
                                            className="btn btn-block btn-primary">Continue <i
                                                className="fa fa-fw fa-caret-right"></i>
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="bg-light py-4 px-md-5 px-3">
                                <h4 className="mb-3">Valid Prescription Guide</h4>
                                <div className="row">
                                    <div className="valid-prescription-list col-lg-7">
                                        <ul className="pl-4">
                                            <li className="mb-2">Don’t crop out any part of the image.</li>
                                            <li className="mb-2">Avoid blurred images.</li>
                                            <li className="mb-2">Include details of doctor and patient + clinic visit date.</li>
                                            <li className="mb-2">Medicines will be dispensed as per prescription.</li>
                                            <li className="mb-2">Supported file types: jpeg, jpg, png.</li>
                                            <li className="mb-2">Maximum allowed file size: 2MB</li>
                                        </ul>
                                    </div>
                                    <div className="col-lg-5">
                                        <img className="img-fluid" src="assets/img/extra/prescription.svg" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default UploadPrescription