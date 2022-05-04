const getRequest = async () => {
  if (account) {
    try {
      const name = document.getElementById("getRequestName").value;
      
      const validData = validateGetRequestFields(name);
      
      if(validData) {
        const contract = new web3.eth.Contract(abi, contractAddress, {
          from: account,
        });
        const request = await contract.methods.getRequest(name).call();
        const reviewForm = await contract.methods.getReviewForm(request.reviewFormIndex).call();
        var rfiText = document.getElementById("rfi-text");
        rfiText.innerHTML = request.reviewFormIndex;
        getReviewForm(reviewForm);
        if(request.reviewers.length > 0) {
          document.getElementById("request-table").style = "display: block";
          document.getElementById("request-info").style = "display: none";
          document.getElementById("requestReviewFormIndexTd").innerHTML = request.reviewFormIndex;
          document.getElementById("requestReviewersTd").innerHTML = request.reviewers.join('<br>');
          document.getElementById("requestTargetsTd").innerHTML = request.targets.join('<br>');
          document.getElementById("requestIpfsHashTd").innerHTML = request.formIpfsHash;
          document.getElementById("requestRewardTd").innerHTML = `${request.rewardPerReview/1000000000000000000} ETH`;
          document.getElementById("requestClosedTd").innerHTML = request.isClosed ? 'Yes' : 'No';
          let reviewsText = "";
          if(request.reviews.length > 0) {
            request.reviews.forEach((review, index) => {
              reviewsText += `<h3 style="margin:0% !important">Review #${index+1}</h3><strong>Reviewer:</strong> ${review.reviewer}<br><strong>Target:</strong> ${request.targets[review.targetIndex]}<br>`
              review.answers.forEach((answer, index) =>{
                reviewsText += `<strong>Question: </strong>${reviewForm[0][index]}<br><strong>Answer: </strong>${answer}<br>`
              });
              reviewsText += "<br>"
            })
          } else {
            reviewsText = 'There are no available reviews for this request yet'
          }
          document.getElementById("requestReviewsTd").innerHTML = reviewsText;
        } else {
          var requestInfo = document.getElementById("request-info")
          requestInfo.innerHTML = "Couldn't find a request with that name"
          requestInfo.style = "display: block";
          document.getElementById("request-table").style = "display: none";
        }
      }
      
    } catch (error) {
      throw error;
    }
  }
};

const getReviewForm = async (reviewForm) => {
  var reviewFormTable = document.getElementById("review-form-table");
  var rfTbody = document.getElementById('rfTbody');
  rfTbody.innerHTML = '';
  reviewForm[0].forEach( (question, index) => {
    var rFormTr = document.createElement('tr');
    var rFormQuestionTd = document.createElement('td');
    var rFormQuestionTypeTd = document.createElement('td');
    rFormTr.appendChild(rFormQuestionTd);
    rFormTr.appendChild(rFormQuestionTypeTd);
    rFormQuestionTd.innerHTML = question;
    rFormQuestionTypeTd.innerHTML = reviewForm[1][index] == 0 ? 'Text' : 'Checkbox';
    rfTbody.appendChild(rFormTr);
  });
  reviewFormTable.style = "display: block;margin-bottom: 5%;";
};

const validateGetRequestFields = (name) => {
  let validName = false;
  
  var nameValidationMessage = document.getElementById("get-request-name-validation");
  
  if(name) {
    nameValidationMessage.style = "display:none";
    validName = true;
  } else {
    nameValidationMessage.innerHTML = "This is a required field";
    nameValidationMessage.style = "display:block";
    validName = false;
  }
  
  return validName;
};

const populateReviewRequestNameSelect = async () => {
  if (account) {
    try {
      const contract = new web3.eth.Contract(abi, contractAddress, {
        from: account,
      });
      
      const rrNames = await contract.methods.getReviewRequestsNames().call();
      const reviewRequestNameDropdown = document.getElementById("getRequestName");
      let optionsHTML = ''
      for (let i = 0; i < rrNames.length; i++) {
        optionsHTML += `<option value="${rrNames[i]}">${rrNames[i]}</option>`;
      }
      reviewRequestNameDropdown.innerHTML += optionsHTML;
    } catch (error) {
      throw error;
    }
  }
};

var prev_onLoad = window.onload;

window.onload = async function () {
  if (typeof(prev_onLoad)=='function')
    prev_onLoad();
    
  document
  .getElementById("getRequestBtn")
  .addEventListener("click", getRequest)
};