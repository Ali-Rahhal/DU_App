import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import { useTranslations } from "next-intl";
import { useState } from "react";

const MyAccount = () => {
  const { firstName, lastName, phone } = useAccountStore();
  const [phoneInput, setPhoneInput] = useState(phone);
  const [fname, setFname] = useState(firstName);
  const [lname, setLname] = useState(lastName);
  const t = useTranslations();

  return (
    <Layout>
      <AccountLayout
        title={t("my_account.title")}
        subTitle={t("my_account.subtitle")}
      >
        <div className="card">
          <div className="card-body">
            <div>
              <form className="row align-items-end">
                <div className="mb-3 col-12 col-md-6">
                  <label className="form-label">
                    {t("my_account.first_name")}
                  </label>
                  <input
                    onChange={(e) => setFname(e.target.value)}
                    value={fname ?? ""}
                    type="text"
                    id="fname"
                    className="form-control"
                    placeholder={t("my_account.first_name_placeholder")}
                  />
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <label className="form-label">
                    {t("my_account.last_name")}
                  </label>
                  <input
                    onChange={(e) => setLname(e.target.value)}
                    value={lname ?? ""}
                    type="text"
                    id="lname"
                    className="form-control"
                    placeholder={t("my_account.last_name_placeholder")}
                  />
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <label className="form-label">{t("my_account.phone")}</label>
                  <input
                    onChange={(e) => setPhoneInput(e.target.value)}
                    value={phoneInput ?? ""}
                    type="text"
                    id="phone"
                    className="form-control"
                    placeholder={t("my_account.phone_placeholder")}
                  />
                </div>
                {/* <div className="mb-3 col-12 col-md-6">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    className="form-control"
                    placeholder="Email"
                    value="abc@abc.com"
                  />
                </div> */}
                <div className="col-12 mb-3 text-lg-right">
                  <button className="btn btn-primary" type="submit" disabled>
                    {t("my_account.edit_details")}
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
