import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useAccountStore, useAuthStore } from "@/store/zustand";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
function LoginModal({ show, handleClose, handleModalShow }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { refreshCart } = useAccountStore();
  const rt = useRouter();
  const t = useTranslations();
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="clean_modal clean_modal-lg"
        style={{
          borderRadius: "8px",
        }}
      >
        <div className="modal-content">
          <button type="button" className="close" onClick={handleClose}>
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="modal-body">
            <div className="row">
              {/* <div className="col-12">
                                <a href="#" className="btn btn-gray-border btn-full rounded btn-large text-capitalize mb-3">
                                    <img src="assets/img/facebook.png" alt="" />
                                    Login with Facebook
                                </a>
                                <a href="#" className="btn btn-gray-border btn-full rounded btn-large text-capitalize">
                                    <img src="assets/img/google.png" alt="" />
                                    Login with Google
                                </a>
                            </div>
                            <div className="col-12 text-center">
                                <p className="text-muted my-4">Or Login With</p>
                            </div> */}
              <div className="col-12 text-center">
                <h4 className="mb-4">{t("login")}</h4>
              </div>
            </div>
            <div className="login_error d-none">
              <div className="alert" role="alert"></div>
            </div>
            <form
              action=""
              id="login_modal_form"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                //login
                await login({ code, password })
                  .then(() => {
                    toast.success("Logged in Successfully", {
                      position: "bottom-center",
                    });
                    setLoading(false);
                    setCode("");
                    setPassword("");
                    handleClose();
                    refreshCart();
                  })
                  .catch((error) => {
                    setLoading(false);
                    toast.error(error.response.data.message, {
                      position: "top-right",
                    });
                  });
              }}
            >
              <div className="form-group">
                <input
                  name={t("user_code")}
                  required
                  type="text"
                  placeholder={t("user_code")}
                  className="form-control input-lg rounded"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  name={t("password")}
                  required
                  type="password"
                  placeholder={t("password")}
                  className="form-control input-lg rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                id="login_btn"
                name="submit"
                className="btn btn-primary btn-full btn-medium rounded"
              >
                {!loading ? (
                  t("login")
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </button>
              <div className="form-group text-center small font-weight-bold mt-3">
                <a href="#" onClick={() => handleModalShow("forgot")}>
                  {" "}
                  {t("forgot_password?")}
                </a>
              </div>
              {/* <hr className="my-4" />
              <div className="form-group text-center small font-weight-bold mb-0">
                Don’t have an account?{" "}
                <a href="#" onClick={() => handleModalShow("register")}>
                  {" "}
                  Register
                </a>
              </div> */}
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default LoginModal;
