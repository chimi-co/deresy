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
      reviewsText += `<h3 style="margin:0% !important">Review ${index+1} by (${review.reviewer})</h3><br><strong>Target</strong><br><a href="${request.targets[review.targetIndex]}" target="_blank">${request.targets[review.targetIndex]}</a><br><br><strong>Target IPFS Hash</strong><br><a href="https://ifps.io/ipfs/${request.targetsIPFSHashes[review.targetIndex]}" target="_blank">${request.targetsIPFSHashes[review.targetIndex]}</a><br><br>`
      console.log('review', review)
      console.log('reviewForm', reviewForm)
      review.answers.forEach((answer, index) =>{
        if(reviewForm[1][index] == '0'){
          reviewsText += `<strong>${reviewForm[0][index]}</strong><br><textarea class="textarea-markdown">${answer}</textarea><br><br>`
        } else{
          reviewsText += `<strong>${reviewForm[0][index]}</strong><br>${answer}<br><br>`
        }
      });
      reviewsText += "<br>"
      reviewTd.innerHTML = reviewsText;
      console.log('reviewsText', reviewsText)
      reviewsTbody.appendChild(reviewTr);
    });
    reviewsTable.style = "display: table; width: 100%;";
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
    document.getElementById("requestTargetsTd").innerHTML = requestTargetsTdHtml(request);
    document.getElementById("requestIpfsHashTd").innerHTML = `<a href="https://ifps.io/ipfs/${request.formIpfsHash}" target="_blank">${request.formIpfsHash}</a>`;
    document.getElementById("requestRewardTd").innerHTML = `${request.rewardPerReview/1000000000000000000} ETH`;
    document.getElementById("requestClosedTd").innerHTML = request.isClosed ? 'Yes' : 'No';
  } else {
    var requestInfo = document.getElementById("request-info")
    requestInfo.innerHTML = "Couldn't find a request with that name"
    requestInfo.style = "display: block; margin-top:5%;";
    document.getElementById("request-table").style = "display: none";
  }
};

const requestTargetsTdHtml = (request) => {
  let targets = request.targets;
  let targetsHashes = request.targetsIPFSHashes;
  let html = ''
  targets.forEach((target, index) => {
    html += `<strong>Target ${index + 1} </strong> <br><a href="${target}" target="_blank">${target}</a><br>`
    if(targetsHashes[index]){
      html += `<strong>Target ${index + 1} IPFS Hash </strong><br> <a href="https://ifps.io/ipfs/${targetsHashes[index]}" target="_blank">${targetsHashes[index]}</a><br>`
    }
    html += '<br>'
  })
  return html;
}

const fillReviewFormTable = async (reviewForm) => {
  var reviewFormTable = document.getElementById("review-form-table");
  var rfTbody = document.getElementById('rfTbody');
  rfTbody.innerHTML = '';
  reviewForm[0].forEach( (question, index) => {
    var rFormTr = document.createElement('tr');
    var rFormQuestionTd = document.createElement('td');
    var rFormQuestionTypeTd = document.createElement('td');
    var rFormChoiceTd = document.createElement('td');
    rFormTr.appendChild(rFormQuestionTd);
    rFormTr.appendChild(rFormQuestionTypeTd);
    rFormTr.appendChild(rFormChoiceTd);
    rFormQuestionTd.innerHTML = question;
    rFormQuestionTypeTd.innerHTML = reviewForm[1][index] == 0 ? 'Text' : reviewForm[1][index] == 1 ? 'Yes/No' : 'Single Choice';
    rFormChoiceTd.innerHTML= reviewForm[2][index].join('<br>');
    rfTbody.appendChild(rFormTr);
  });
  const textAreas = document.getElementsByClassName("textarea-markdown");
  console.log('textAreas', textAreas.length)
  for (let textArea of textAreas) {
    const s = new SimpleMDE({ element: textArea, toolbar: false, spellChecker: false, status: false });
    s.togglePreview();
  }
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