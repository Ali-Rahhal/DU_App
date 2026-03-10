import dynamic from "next/dynamic";
import { ComponentCollection, Serializer } from "survey-core";

//Global Styles
// import "survey-core/defaultV2.min.css";
//SurveyJS
// import SurveyPage from "@/components/survey/SurveyPage";
const SurveyPage = dynamic(() => import("@/components/survey/SurveyPage"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <Spinner
        animation="border"
        style={{
          width: "150px",
          height: "150px",
        }}
        variant="primary"
        role="status"
      ></Spinner>
    </div>
  ),
});
import "react-toastify/dist/ReactToastify.css";
import { publicApi } from "@/utils/apiCalls";
import Layout from "@/components/Layout/Layout";
import { Spinner } from "react-bootstrap";
import { ALL_PERMISSIONS } from "@/utils/data";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";
function App() {
  // Authorization Check:
  const rt = useRouter();
  const { role, checkPermission } = useAccountStore();
  const hasShownToast = useRef(false);
  useEffect(() => {
    if (!checkPermission(ALL_PERMISSIONS.Survey) && !hasShownToast.current) {
      toast.error("You don't have permission to access the Survey page");
      hasShownToast.current = true;
      rt.push("/");
    }
  }, [role]);
  if (!checkPermission(ALL_PERMISSIONS.Survey)) return null;

  if (!Serializer.findClass("itemselector")) {
    ComponentCollection.Instance.add({
      // A unique name; must use lowercase
      name: "itemselector",
      // A display name used in the Toolbox
      title: "Item Selector",
      // A JSON schema for the base question type (Dropdown in this case)
      questionJSON: {
        type: "dropdown",
        name: "Itemx",
        placeholder: "Select an Item...",
        choicesLazyLoadEnabled: true,
        choicesLazyLoadPageSize: 25,
        choicesByUrl: {
          url: publicApi + `/survey/get-products?skip=0&take=25`,
        },
      },
    });
  }
  if (!Serializer.findClass("itemselectormulti")) {
    ComponentCollection.Instance.add({
      // A unique name; must use lowercase
      name: "itemselectormulti",
      // A display name used in the Toolbox
      title: "Item Multiple Selector",
      // A JSON schema for the base question type (Dropdown in this case)
      questionJSON: {
        type: "tagbox",
        name: "ItemTagx",
        placeholder: "Select Item/s...",
        choicesLazyLoadEnabled: true,
        choicesLazyLoadPageSize: 25,
        choicesByUrl: {
          url: publicApi + `/survey/get-products?skip=0&take=25`,
        },
      },
    });
  }

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SurveyPage />
      </div>
    </Layout>
  );
}

export default App;
