import Modal from 'react-bootstrap/Modal';

function ForgotModal({ show, handleClose, handleModalShow }) {
    return (
        <>
            <Modal show={show} onHide={handleClose} centered className='clean_modal'>
                <div className="modal-content">
                    <button type="button" className="close" onClick={handleClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div className="modal-body">
                        <form action="#" method="POST">
                            <div className="form-group">
                                <input name="password" type="password" placeholder="Old Password"
                                    className="form-control input-lg rounded" />
                            </div>
                            <div className="form-group">
                                <input name="password" type="password" placeholder="New Password"
                                    className="form-control input-lg rounded" />
                            </div>
                            <div className="form-group">
                                <input name="password" type="text" placeholder="Confirm Password"
                                    className="form-control input-lg rounded" />
                            </div>
                            <button type="submit" name="submit" className="btn btn-primary btn-full btn-medium rounded">Change
                                Password</button>
                            <div className="form-group text-center small font-weight-bold mt-3">
                                Want to <a href="#" onClick={() => handleModalShow('login')}> Login?</a>
                            </div>
                            <hr className="my-4" />
                            <div className="form-group text-center small font-weight-bold mb-0">
                                Don’t have an account? <a href="#" onClick={() => handleModalShow('register')}> Register</a>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default ForgotModal;