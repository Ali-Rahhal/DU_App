import { useAuthStore } from "@/store/zustand";
// import { register } from "@/utils/apiCalls";
import { useState } from "react";
import { Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";

function RegisterModal({ show, handleClose, handleModalShow }) {
  const [registerData, setRegisterData] = useState({
    firstName: "",

    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="clean_modal clean_modal-lg"
      >
        <div className="modal-content">
          <button type="button" className="close" onClick={handleClose}>
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="modal-body">
            <div className="register_error d-none">
              <div className="alert f-size-16" role="alert"></div>
            </div>
            <form
              action=""
              id="register_form"
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                // register({
                //   first_name: registerData.firstName,
                //   last_name: registerData.lastName,
                //   email: registerData.email,
                //   phone_number: registerData.phone,
                //   password: registerData.password,
                // })
                //   .then((res) => {
                //     setLoading(false);
                //     toast.success("Registered Successfully", {
                //       position: "top-right",
                //     });
                //     setRegisterData({
                //       firstName: "",
                //       lastName: "",
                //       email: "",
                //       phone: "",
                //       password: "",
                //     });
                //     handleModalShow("login");
                //   })
                //   .catch((error) => {
                //     setLoading(false);
                //     toast.error(error.response.data.message, {
                //       position: "top-right",
                //     });
                //   });
              }}
            >
              <div className="row">
                {/* <div className="col-12">
                  <a
                    href="#"
                    className="btn btn-gray-border btn-full rounded btn-large text-capitalize mb-3"
                  >
                    <img src="assets/img/facebook.png" alt="" />
                    Register with Facebook
                  </a>
                  <a
                    href="#"
                    className="btn btn-gray-border btn-full rounded btn-large text-capitalize"
                  >
                    <img src="assets/img/google.png" alt="" />
                    Register with Google
                  </a>
                </div>
                <div className="col-12 text-center">
                  <p className="text-muted my-4">Or Register With</p>
                </div> */}
                <div className="col-12 text-center">
                  <h4 className="mb-4">Register</h4>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group mb-3">
                    <input
                      className="form-control"
                      required
                      name="fname"
                      placeholder="First Name"
                      type="text"
                      value={registerData.firstName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group mb-3">
                    <input
                      className="form-control"
                      required
                      name="lname"
                      placeholder="Last Name"
                      type="text"
                      value={registerData.lastName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="form-group mb-3">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="form-control rounded"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group mb-3">
                <input
                  name="phone"
                  type="text"
                  required
                  placeholder="Phone"
                  className="form-control rounded checkIsNumber phone-check"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group mb-3">
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  className="form-control rounded"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                id="register_btn"
                disabled={loading}
                name="submit"
                className="btn btn-primary btn-full btn-medium rounded"
              >
                {!loading ? (
                  "Register"
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </button>
              <div className="form-group text-center small font-weight-bold mt-3">
                By continuing you agree to our{" "}
                <a href="#"> Terms and conditions.</a>
              </div>
              <hr className="my-4" />
              <div className="form-group text-center small font-weight-bold mb-0">
                Don’t have an account?{" "}
                <a href="#" onClick={() => handleModalShow("login")}>
                  {" "}
                  Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default RegisterModal;
