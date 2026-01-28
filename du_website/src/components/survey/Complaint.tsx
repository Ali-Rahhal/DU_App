import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { useCallback, useEffect, useState } from "react";

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
function Complaint() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [start, setStart] = useState(false);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [surveyJson, setSurveyJson] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
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
              : 0,
        };
        resultData.push(item);
      }
    }
    // console.log(sender.data);
    console.log(resultData);

    saveComplaint({
      complaint_id: selectedQuestion,
      answers: resultData,
    }).then((res) => {
      if (res.status === 200) {
        toast.success("Complaint Submitted Successfully");
      }
      setCompleted(true);
      setSelectedQuestion(null);
      setSurveyJson(null);
      window.localStorage.setItem(storageName, null);
    });
  };
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
            <h2 className="header_survey">We are here to assist you!</h2>
            <p className="sub-text">
              If you have any complaints Please Let Us Know How We Can Help You,
              Or if You Have Any Other Inquiries Please Contact Us.
            </p>
          </div>
          <div className="formCon">
            <div className="formHeader">Type of Complaint</div>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedQuestion) {
                  startSurvey();
                } else {
                  toast.info("Please Select a Complaint Type");
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
                <option value="">Choose an option...</option>
                {complaintTypes.map((survey) => {
                  return (
                    <option key={survey.id} value={survey.id}>
                      {survey.name}
                    </option>
                  );
                })}
              </select>
              <button className="btn btn-primary btn-rounded btn-full btn-large">
                Next
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
              Cancel
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
          <h1>Thank you for your feedback</h1>
          <p>Have a nice day</p>
          <button className="btn" onClick={() => cancelSurvey()}>
            Answer Another Survey
          </button>
        </div>
      </div>
    );
  } else {
    return <div>Tf?</div>;
  }
}

export default Complaint;
