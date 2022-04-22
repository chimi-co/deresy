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
        if(request.reviewers.length > 0) {
          document.getElementById("request-table").style = "display: block";
          document.getElementById("request-info").style = "display: none";
          document.getElementById("requestReviewersTd").innerHTML = request.reviewers.join('<br>');
          document.getElementById("requestTargetsTd").innerHTML = request.targets.join('<br>');
          document.getElementById("requestIpfsHashTd").innerHTML = request.formIpfsHash;
          document.getElementById("requestRewardTd").innerHTML = `${request.rewardPerReview/1000000000000000000} ETH`;
          document.getElementById("requestClosedTd").innerHTML = request.isClosed;
          let reviewsText = "";
          console.log(request)
          if(request.review) {
            request.review.forEach(review => {
              reviewsText += `<strong>Reviewer:</strong> ${review.reviewer}<br><strong>Target Index:</strong> ${review.targetIndex}<br><strong><br>`
              review.answers.forEach((answer, index) =>{
                reviewsText += `<strong>Question ${index + 1}</strong><br>${answer}<br>`
              })
            })
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

var prev_onLoad = window.onload;

window.onload = async function () {
  if (typeof(prev_onLoad)=='function')
    prev_onLoad();
    
  document
  .getElementById("getRequestBtn")
  .addEventListener("click", getRequest)
};