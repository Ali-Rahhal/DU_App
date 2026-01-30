import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { useCallback, useEffect, useState } from "react";
import * as SurveyCore from "survey-core";
import { microphone } from "surveyjs-widgets";
import { toast } from "react-toastify";
import {
  configureQuayoSurvey,
  removeBase64Prefix,
} from "../../utils/surveyUtils";
import {
  getComplaintElements,
  getComplaints,
  saveComplaint,
} from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import { Spinner } from "react-bootstrap";
function Complaint() {
  const t = useTranslations();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [start, setStart] = useState(false);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [surveyJson, setSurveyJson] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  // const exampleSurvey = {
  //   showProgressBar: "top",
  //   pages: [
  //     {
  //       elements: [
  //         {
  //           title: "Please record your complaint",
  //           type: "microphone",
  //           name: "question1",
  //         },

  //         {
  //           type: "file",
  //           title: "Please upload your photo",
  //           name: "image",
  //           storeDataAsText: false,

  //           imageWidth: 150,
  //         },
  //         {
  //           name: "satisfaction-score",
  //           title: {
  //             default:
  //               "How would you describe your experience with our product?",
  //             id: "hiol",
  //           },
  //           type: "radiogroup",
  //           choices: [
  //             { value: 5, text: "Fully satisfying" },
  //             { value: 4, text: "Generally satisfying" },
  //             { value: 3, text: "Neutral" },
  //             { value: 2, text: "Rather unsatisfying" },
  //             { value: 1, text: "Not satisfying at all" },
  //           ],
  //           isRequired: true,
  //         },
  //       ],
  //     },
  //     {
  //       elements: [
  //         {
  //           name: "what-would-make-you-more-satisfied",
  //           title: "What can we do to make your experience more satisfying?",
  //           type: "comment",
  //         },
  //         {
  //           name: "nps-score",
  //           title:
  //             "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
  //           type: "rating",
  //           rateMin: 1,
  //           rateMax: 5,
  //         },
  //       ],
  //     },
  //     {
  //       elements: [
  //         {
  //           name: "how-can-we-improve",
  //           title: "In your opinion, how could we improve our product?",
  //           type: "comment",
  //         },
  //       ],
  //     },
  //     {
  //       elements: [
  //         {
  //           name: "disappointing-experience",
  //           title:
  //             "Please let us know why you had such a disappointing experience with our product",
  //           type: "comment",
  //         },
  //         {
  //           type: "signaturepad",
  //           name: "signature",
  //           title: "Please sign here",
  //           isRequired: false,
  //         },
  //       ],
  //     },
  //   ],
  // };
  useEffect(() => {
    microphone(SurveyCore);
    const getAllComplaints = async () => {
      getComplaints().then((res) => {
        setComplaintTypes(res.data.result);
      });
    };
    getAllComplaints();
  }, []);
  useEffect(() => {
    const getComplaint = async () => {
      getComplaintElements(selectedQuestion).then((res) => {
        const data = res.data.result;

        const updatedPages = data.pages.map((page) => ({
          name: page?.name,
          elements: page.elements.map((question) => {
            if (question.type === "file") {
              return {
                ...question,
                // imageWidth: 150,
                showPreview: true,
                storeDataAsText: false,
              };
            } else {
              return question;
            }
          }),
        }));

        setSurveyJson({
          showProgressBar: "top",
          title: data.title,
          pages: updatedPages,
        });
      });
    };

    if (selectedQuestion !== null) {
      getComplaint();
    }
    //  setSurveyJson(exampleSurvey);
  }, [selectedQuestion]);

  var storageName = `quayo_complaint_${selectedQuestion}}`;
  let survey = new Model(surveyJson);
  configureQuayoSurvey(survey);
  function saveSurveyData(survey) {
    var data = survey.data;
    data.pageNo = survey.currentPageNo;
    window.localStorage.setItem(storageName, JSON.stringify(data));
  }
  survey.onPartialSend.add(function (sender) {
    saveSurveyData(sender);
  });
  survey.onComplete.add(function (sender, options) {
    saveSurveyData(sender);
    surveyComplete(sender);
  });

  var prevData = window.localStorage.getItem(storageName) || null;
  if (prevData) {
    var data = JSON.parse(prevData);
    survey.data = data;
    if (data?.pageNo) {
      survey.currentPageNo = data.pageNo;
    }
  }
  const startSurvey = useCallback(() => {
    setCompleted(false);
    setStart(true);
  }, []);
  const cancelSurvey = () => {
    setStart(false);
    setCompleted(false);
    setSelectedQuestion(null);
    setSurveyJson(null);
  };

  const surveyComplete = async (sender) => {
    // console.log(sender.data)
    setLoading(true);
    setSurveyData(sender.data);
    const resultData = [];
    for (const key in sender.data) {
      const question = sender.getQuestionByName(key);
      if (!!question) {
        const item = {
          key: key,
          // value: question.value,
          // displayValue: question.displayValue,
          // title: question.displayValue,
          value:
            question.getType() === "file"
              ? removeBase64Prefix(question.value[0].content)
              : question.getType() === "signaturepad"
              ? removeBase64Prefix(question.displayValue.toString())
              : question.displayValue.toString(),
          type: question.getType(),
          question_type_id:
            question.getType() === "file" ||
            question.getType() === "signaturepad"
              ? 1
              : question.getType() === "microphone"
              ? 2
              : 0,
        };
        resultData.push(item);
      }
    }
    // console.log(sender.data);
    // console.log(resultData);

    saveComplaint({
      complaint_id: selectedQuestion,
      answers: resultData,
    })
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          toast.success("Complaint Submitted Successfully");
        }
        setCompleted(true);
        setSelectedQuestion(null);
        setSurveyJson(null);
        window.localStorage.setItem(storageName, null);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Error Submitting Complaint");
      });
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
          gap: "20px",
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
        <h3 style={{ marginLeft: "10px" }}>
          {/* Loading Complaint Form... */}
          {t("submitting")}...
        </h3>
      </div>
    );
  }
  if (!start && !completed) {
    return (
      <div id="surveyElement" className="complaint-con">
        <div className="main-con">
          <div className="left">
            <img
              src={"/assets/img/logo_cropped.png"}
              alt="Logo"
              style={{
                width: "100px",
                height: "34px",
              }}
            />
            <h2 className="header_survey">
              {/* We are here to assist you! */}
              {/* to french */}
              {t("complaint_page.header")}
            </h2>
            <p className="sub-text">
              {/* If you have any complaints Please Let Us Know How We Can Help You,
              Or if You Have Any Other Inquiries Please Contact Us. */}
              {/* to french */}
              {/* Si vous avez des plaintes, veuillez nous faire savoir comment nous
              pouvons vous aider, ou si vous avez d'autres questions, veuillez
              nous contacter. */}
              {t("complaint_page.body")}
            </p>
          </div>
          <div className="formCon">
            <div className="formHeader">
              {/* Type of Complaint */}
              {t("complaint_page.complaint_type")}
            </div>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedQuestion) {
                  startSurvey();
                } else {
                  toast.info(
                    // "Please Select a Complaint Type"
                    t("complaint_page.select_complaint")
                  );
                }
              }}
            >
              <select
                className="form-control select_complaint "
                style={{
                  width: "100%",
                }}
                onChange={(e) => {
                  setSelectedQuestion(e.target.value);
                }}
              >
                <option value="">
                  {/* Choose an option... */}
                  {t("complaint_page.choose_option")}
                </option>
                {complaintTypes.map((survey) => {
                  return (
                    <option key={survey.id} value={survey.id}>
                      {survey.name}
                    </option>
                  );
                })}
              </select>
              <button className="btn btn-primary btn-rounded btn-full btn-large">
                {t("next")}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  if (start && !completed) {
    return (
      <div className="App" id="surveyElement">
        <div className="surveyCon">
          <div className="top-bar">
            <button className="text-btn" onClick={() => cancelSurvey()}>
              {/* Cancel */}
              {t("cancel")}
            </button>
            <div></div>
          </div>
          {surveyJson ? <Survey designerHeight="" model={survey} /> : ""}
        </div>
      </div>
    );
  }
  if (start && completed) {
    return (
      <div className="App" id="surveyElement">
        <div className="thank-you-con">
          <img
            src={"/assets/img/logo_cropped.png"}
            alt="Logo"
            style={{
              width: "200px",
              height: "100px",
            }}
          />
          <h1>
            {/* Thank you for your feedback */}
            {t("complaint_page.thank_you")}
          </h1>
          <p className="sub-text">
            {/* Have a nice day */}
            {t("complaint_page.have_a_nice_day")}
          </p>
          <button
            className=" btn btn-primary btn-rounded btn-full btn-large"
            onClick={() => cancelSurvey()}
          >
            {/* Answer Another Survey */}
            {t("complaint_page.answer_another_survey")}
          </button>
        </div>
      </div>
    );
  } else {
    return <div>Tf?</div>;
  }
}

export default Complaint;
