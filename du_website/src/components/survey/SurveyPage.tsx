import { Model } from "survey-core";

import { Survey } from "survey-react-ui";
import { useCallback, useEffect, useState } from "react";
import Lottie from "lottie-react";
import surveyLottie from "../../assets/survey.json";
import { toast } from "react-toastify";
import {
  configureQuayoSurvey,
  removeBase64Prefix,
} from "../../utils/surveyUtils";
import { getSurveyElements, getSurveys, saveSurvey } from "@/utils/apiCalls";

function SurveyPage() {
  const [surveys, setSurveys] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [start, setStart] = useState(false);
  const [surveyJson, setSurveyJson] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // document.title = "Quayo | Survey";
    const getAllSurveys = async () => {
      await getSurveys().then((res) => {
        setSurveys(res.data.result);
      });
    };
    getAllSurveys();
  }, []);

  useEffect(() => {
    const getSurvey = async () => {
      // await userRequest
      //   .get("/survey/get-survey?id=" + selectedQuestion)
      //   .then((res) => {
      //     const updatedPages = res.data.pages.map((page) => ({
      //       name: page?.name,
      //       elements: page.elements.map((question) => {
      //         if (question.type === "file") {
      //           return {
      //             ...question,
      //             // imageWidth: 150,
      //             showPreview: true,
      //             storeDataAsText: false,
      //           };
      //         } else {
      //           return question;
      //         }
      //       }),
      //     }));
      //     setSurveyJson({
      //       showProgressBar: "top",
      //       title: res.data.name,
      //       pages: updatedPages,
      //     });
      //   });
      getSurveyElements(selectedQuestion).then((res) => {
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
      getSurvey();
    }
  }, [selectedQuestion]);
  // const exampleSurvey = {
  //   showProgressBar: "top",
  //   pages: [
  //     {
  //       elements: [
  //         {
  //           type: "file",
  //           title: "Please upload your photo",
  //           name: "image",
  //           storeDataAsText: false,
  //           showPreview: true,
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
  var storageName = `quayo_survey_${selectedQuestion}}`;
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
    // console.log(sender.data);
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
    console.log(resultData);
    // const surveyId = body["survey_id"];
    // const answers = body["answers"];
    // const result: any = await saveSurveyAnswer(surveyId, answers, userId);
    saveSurvey({
      survey_id: selectedQuestion,
      answers: resultData,
    }).then((res) => {
      if (res.status === 200) {
        toast.success("Survey Submitted Successfully");
      }
      setCompleted(true);
      setSelectedQuestion(null);
      setSurveyJson(null);
      window.localStorage.setItem(storageName, null);
    });

    // await userRequest
    //   .post(
    //     "/survey/upload-survey-answers?id=" + selectedQuestion,

    //     resultData
    //   )
    //   .then((res) => {
    //     if (res.status === 200) {
    //       toast.success("Survey Submitted Successfully");
    //     }
    //     setCompleted(true);
    //     setSelectedQuestion(null);
    //     setSurveyJson(null);
    //     window.localStorage.setItem(storageName, null);
    //   })
    //   .catch((err) => {
    //     toast.error("Something went wrong");
    //   });
  };

  if (!start && !completed) {
    return (
      <div id="surveyElement">
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
            <p className="header_survey">Customer Satisfaction Survey</p>
            <p className="sub-text">
              We are always looking for ways to improve our products and
              services, Please take a few minutes to complete this survey.
            </p>
            <div
              style={{
                margin: "20px 0px",
                width: "100%",
                padding: "0 20px",
              }}
            >
              {" "}
              <select
                className="form-control select_survey "
                style={{
                  width: "100%",
                }}
                onChange={(e) => {
                  setSelectedQuestion(e.target.value);
                }}
              >
                <option value="">Choose an option...</option>
                {surveys.map((survey) => {
                  return (
                    <option key={survey.id} value={survey.id}>
                      {survey.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div
              style={{
                width: "100%",
                padding: "0 20px",
              }}
            >
              <button
                className="btn btn-primary btn-rounded btn-full btn-large"
                style={{
                  width: "100%",
                }}
                onClick={() => {
                  if (selectedQuestion) {
                    startSurvey();
                  } else {
                    toast.info("Please select a survey");
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>

          <Lottie
            animationData={surveyLottie}
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "100%",
              minHeight: "500px",
              margin: "0 auto",
            }}
            loop={true}
          />
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
          <button
            className="btn btn-primary btn-rounded btn-full btn-large"
            onClick={() => cancelSurvey()}
          >
            Answer Another Survey
          </button>
        </div>
      </div>
    );
  } else {
    return <div>Tf?</div>;
  }
}

export default SurveyPage;
