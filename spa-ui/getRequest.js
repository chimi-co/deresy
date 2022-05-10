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
        fillReviewsTable(reviewForm, request);
        fillReviewRequestTable(request);
        fillReviewFormTable(reviewForm);
      }
    } catch (error) {
      throw error;
    }
  }
};

const fillReviewsTable = (reviewForm, request) => {
  var noReviewsDiv = document.getElementById("no-reviews-message");
  document.getElementById("reviews-table-div").style="display:block";
  var reviewsTable = document.getElementById("reviews-table");
  if(request.reviews.length > 0) {
    noReviewsDiv.style = "display:none;"
    var reviewsTbody = document.getElementById('reviewsTbody');
    reviewsTbody.innerHTML = '';
    var oddTd = true;
    request.reviews.forEach( (review, index) => {
      var reviewTr = document.createElement('tr');
      if(oddTd){
        reviewTr.classList.add("pure-table-odd");
      }
      oddTd = !oddTd;
      var reviewTd = document.createElement('td');
      reviewTr.appendChild(reviewTd);
      let reviewsText = "";
      reviewsText += `<h3 style="margin:0% !important">Review ${index+1} by (${review.reviewer})</h3><br><strong>Target:</strong> ${request.targets[review.targetIndex]}<br><br>`
      review.answers.forEach((answer, index) =>{
        reviewsText += `<strong>${reviewForm[0][index]}</strong><br>${answer}<br><br>`
      });
      reviewsText += "<br>"
      reviewTd.innerHTML = reviewsText;
      reviewsTbody.appendChild(reviewTr);
    });
    reviewsTable.style = "display: block;";
  } else {
    noReviewsDiv.innerHTML = '<strong>There are no available reviews for this request yet</strong>'
    reviewsTable.style = "display:none;"
    noReviewsDiv.style = "display:block;"
  }
}

const fillReviewRequestTable = (request) => {
  if(request.reviewers.length > 0) {
    document.getElementById("request-table").style = "display: block; margin-top: 5%;";
    document.getElementById("request-info").style = "display: none";
    document.getElementById("requestReviewFormIndexTd").innerHTML = request.reviewFormIndex;
    document.getElementById("requestReviewersTd").innerHTML = request.reviewers.join('<br>');
    document.getElementById("requestTargetsTd").innerHTML = request.targets.join('<br>');
    document.getElementById("requestIpfsHashTd").innerHTML = request.formIpfsHash;
    document.getElementById("requestRewardTd").innerHTML = `${request.rewardPerReview/1000000000000000000} ETH`;
    document.getElementById("requestClosedTd").innerHTML = request.isClosed ? 'Yes' : 'No';
  } else {
    var requestInfo = document.getElementById("request-info")
    requestInfo.innerHTML = "Couldn't find a request with that name"
    requestInfo.style = "display: block; margin-top:5%;";
    document.getElementById("request-table").style = "display: none";
  }
};

const fillReviewFormTable = async (reviewForm) => {
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
  reviewFormTable.style = "display: block;margin-top: 5%;";
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
      
      const rrNames =  await contract.methods.getReviewRequestsNames().call();
      const noResultsDiv = document.getElementById("no-results-message");
      const getRequestDiv = document.getElementById("get-request-div");
      if(rrNames.length > 0){
        noResultsDiv.style = "display:none";
        getRequestDiv.style = "display:block";
        const reviewRequestNameDropdown = document.getElementById("getRequestName");
        let optionsHTML = ''
        for (let i = 0; i < rrNames.length; i++) {
          optionsHTML += `<option value="${rrNames[i]}">${rrNames[i]}</option>`;
        }
        reviewRequestNameDropdown.innerHTML += optionsHTML;
      } else{
        noResultsDiv.innerHTML = '<strong>There are no Review Requests in the system at this time. <a href="./create_request.html">Click here</a> to create a Review Request</strong>'
        noResultsDiv.style = "display:block";
        getRequestDiv.style = "display:none";
      }
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