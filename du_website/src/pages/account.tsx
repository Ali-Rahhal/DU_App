import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import { useState } from "react";

const MyAccount = () => {
  const { firstName, lastName, phone } = useAccountStore();
  const [phoneInput, setPhoneInput] = useState(phone);
  const [fname, setFname] = useState(firstName);
  const [lname, setLname] = useState(lastName);

  return (
    <Layout>
      <AccountLayout
        title="Account Details"
        subTitle="You have full control to manage your own Account."
      >
        <div className="card">
          <div className="card-body">
            <div>
              <form className="row align-items-end">
                <div className="mb-3 col-12 col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    onChange={(e) => setFname(e.target.value)}
                    value={fname}
                    type="text"
                    id="fname"
                    className="form-control"
                    placeholder="First Name"
                  />
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    onChange={(e) => setLname(e.target.value)}
                    value={lname}
                    type="text"
                    id="lname"
                    className="form-control"
                    placeholder="Last Name"
                  />
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    onChange={(e) => setPhoneInput(e.target.value)}
                    value={phoneInput}
                    type="text"
                    id="fname"
                    className="form-control"
                    placeholder="Phone"
                  />
                </div>
                {/* <div className="mb-3 col-12 col-md-6">
                  <label className="form-label" for="fname">
                    Email
                  </label>
                  <input
                    type="text"
                    id="fname"
                    className="form-control"
                    placeholder="Email"
                    value="abc@abc.com"
                  />
                </div> */}
                <div className="col-12 mb-3 text-lg-right">
                  <button className="btn btn-primary" type="submit">
                    edit details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default MyAccount;
