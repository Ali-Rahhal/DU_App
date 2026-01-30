import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
import { publicApi } from "./apiCalls";
import { Model } from "survey-core";

export const removeBase64Prefix = (base64) => {
  return base64;
  return base64.replace(/^data:image\/(png|jpg|jpeg|svg);base64,/, "");
};
function sendRequest(url, onloadSuccessCallback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onload = () => {
    if (xhr.status === 200) {
      onloadSuccessCallback(JSON.parse(xhr.response));
    }
  };
  xhr.send();
}
const compressFiles = async (files) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type.includes("image")) {
          const compressedFile = await imageCompression(file, options).then(
            (res) => res
          );
          return compressedFile;
        }
      })
    );

    return compressedFiles;
  } catch (error) {
    console.log(error);
  }
};
function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export const configureQuayoSurvey = (survey: Model) => {
  const hasMicrophone = survey
    .getAllQuestions()
    .some((q) => q.getType() === "microphone");
  survey.showPreviewBeforeComplete = hasMicrophone
    ? "noPreview"
    : "showAnsweredQuestions";
  survey.sendResultOnPageNext = true;
  //add css classname of microphone items
  survey.onAfterRenderQuestion.add((_, options) => {
    if (options.question.getType() === "microphone") {
      const buttons = options.htmlElement.querySelectorAll("button");
      const audio = options.htmlElement.querySelector("audio");

      const recordButton = buttons[0];
      const stopButton = buttons[1];
      if (!recordButton || !stopButton) return;
      const stopIcon = stopButton?.querySelector("i");

      buttons.forEach((button) => {
        button.classList.add("btn-primary");
        button.classList.add("btn-sm");
        button.classList.add("microphone_button");
      });

      audio.style.display = "none";
      audio.classList.add("microphone_audio");
      stopButton.classList.add("recording");

      stopIcon.classList.remove("fa-cloud");
      stopIcon.classList.add("fa-floppy-o");
      recordButton.addEventListener("click", () => {
        audio.style.display = "none";
        recordButton.classList.add("recording");
        stopButton.classList.remove("recording");
        toast.loading("Recording", {
          toastId: "recording",
          icon: "🎤",
        });
      });
      stopButton.addEventListener("click", () => {
        audio.style.display = "";
        recordButton.classList.remove("recording");
        stopButton.classList.add("recording");
        toast.dismiss("recording");
      });
    }
  });
  survey.onUpdateQuestionCssClasses.add((_, options) => {
    const classes = options.cssClasses;
    if (options.question.getType() === "microphone") {
      classes.root = "microphone_question";
    }
  });
  survey.onUploadFiles.add(async (survey, options) => {
    const id = toast.loading("Uploading...");

    try {
      const compressedFiles = await compressFiles(options.files).then(
        (res) => res
      );

      // options.callback("success", compressedFiles);
      options.callback(
        "success",
        await Promise.all(
          compressedFiles.map(async (f) => {
            return {
              content: await blobToBase64(f),
              file: f,
            };
          })
        )
      );
    } catch (error) {
      console.log(error);
    }
    toast.dismiss(id);
  });
  // survey.onUploadFiles.add(function (survey, options) {
  //   console.log("test", options.files);
  // });
  survey.onChoicesLazyLoad.add((_, options) => {
    if (
      options.question.getType() === "dropdown" &&
      options.question.name === "Itemx"
    ) {
      //const url = `https://surveyjs.io/api/CountriesExamplePagination?skip=${options.skip}&take=${options.take}&filter=${options.filter}`;
      const url =
        publicApi +
        `/survey/get-products?skip=${options.skip}&take=${options.take}&search=${options.filter}`;
      sendRequest(url, (data) => {
        options.setItems(data.result.products, data.result.items_count);
      });
    }
    if (
      options.question.getType() === "tagbox" &&
      options.question.name === "ItemTagx"
    ) {
      const url =
        publicApi +
        `/survey/get-products?skip=${options.skip}&take=${options.take}&search=${options.filter}`;
      sendRequest(url, (data) => {
        options.setItems(data.result.products, data.result.items_count);
      });
    }
  });
};
