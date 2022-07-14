const createRequest = async () => {
  if (account) {
    let alertBox = document.getElementById("create-request-info");
    try {
      alertBox.innerHTML="";
      alertBox.classList.remove("error");
      alertBox.classList.remove("success");
      alertBox.classList.remove("info");

      const { eth } = web3;
      const contract = new eth.Contract(abi, contractAddress, {
        from: account,
      });
      const provider = web3.currentProvider.isMetaMask;
      
      const _name = document.getElementById("requestName").value;
      const reviewers = Array.prototype.slice.call(document.getElementsByName('reviewers[]'));
      const reviewersValues = reviewers.map((o) => o.value);
      const targets = Array.prototype.slice.call(document.getElementsByName('targets[]'));
      const targetsValues = targets.map((o) => o.value);
      const targetsIPFSHashes = Array.prototype.slice.call(document.getElementsByName('targetsIPFSHashes[]'));
      const targetsIPFSHashesValues = targetsIPFSHashes.map((o) => o.value);
      const reviewFormIndex = document.getElementById("reviewFormIndex").value;
      const formIpfsHash = document.getElementById("ipfsHash").value;
      const rewardPerReview = document.getElementById("rewardPerReview").value;
      
      const validData = validateCreateRequestFields(_name, reviewFormIndex, rewardPerReview);
      
      if(validData) {
        const rewardPerReviewToWei = web3.utils.toWei(rewardPerReview.toString(), "ether");
        const total = reviewers.length * targets.length * rewardPerReviewToWei;
        
        const data = await contract.methods
        .createRequest(
          _name,
          reviewersValues,
          targetsValues,
          targetsIPFSHashesValues,
          formIpfsHash,
          rewardPerReviewToWei,
          reviewFormIndex,
          )
          .encodeABI();
          
          const transaction = {
            from: account,
            to: contractAddress,
            data,
            value: total,
          };
          
          await web3.eth
          .sendTransaction(transaction)
          .on("transactionHash", (txHash) => {
            alertBox.classList.remove("error");
            alertBox.classList.remove("success");
            alertBox.classList.add("info");
            alertBox.innerHTML = 'In Progress... <img width="2%" src="spinner.gif"/>';
          })
          .on("receipt", function (receipt) {
            alertBox.classList.remove("error");
            alertBox.classList.remove("info");
            alertBox.classList.add("success");
            alertBox.innerHTML = "Successful!";
          })
          .on("error", console.error);
        }
      } catch (error) {
        alertBox.classList.remove("warning");
        alertBox.classList.remove("info");
        alertBox.classList.remove("success");
        alertBox.classList.add("error");
        alertBox.innerHTML = "Error...";
        if (error.code === 4001) {
          alertBox.innerHTML = "User rejected transaction...";
        }
        if (error.code === -32603) {
          alertBox.innerHTML = "Caller is not the owner...";
        }
        throw error;
      }
    }
  };
  
  const validateCreateRequestFields = (name, reviewFormIndex, reward) => {
    let validName = false;
    let validReviewers = false;
    let validTargets = false;
    let validReviewFormIndex = false;
    let validReward = false;
    
    var nameValidationMessage = document.getElementById("name-validation");
    var reviewFormIndexValidationMessage = document.getElementById("review-form-index-validation");
    var rewardValidationMessage = document.getElementById("reward-validation");
    
    if(name) {
      nameValidationMessage.style = "display:none";
      validName = true;
    } else {
      nameValidationMessage.innerHTML = "This is a required field";
      nameValidationMessage.style = "display:block";
      validName = false;
    }
    
    if(reviewFormIndex) {
      reviewFormIndexValidationMessage.style = "display:none";
      validReviewFormIndex = true;
    } else {
      reviewFormIndexValidationMessage.innerHTML = "This is a required field";
      reviewFormIndexValidationMessage.style = "display:block";
      validReviewFormIndex = false;
    }
    
    if(reward) {
      rewardValidationMessage.style = "display:none";
      validReward = true;
    } else {
      rewardValidationMessage.innerHTML = "This is a required field";
      rewardValidationMessage.style = "display:block";
      validReward = false;
    }
    
    var targetFields = document.getElementsByName('targets[]');
    var targetValues = [];
    
    targetFields.forEach(function(target) {
      var validationMessage = target.parentNode.parentNode.querySelector('.validation-error');
      if(target.value){
        if(targetValues.includes(target.value)){
          validationMessage.innerHTML = "Duplicated target";
          validationMessage.style = "display:block";
          validTargets = false;
        } else {
          targetValues.push(target.value);
          validationMessage.style = "display:none";
          validTargets = true;
        }
      } else {
        validationMessage.innerHTML = "This is a required field";
        validationMessage.style = "display:block";
        validTargets = false;
      }
    });
    
    var reviewerFields = document.getElementsByName('reviewers[]');
    var reviewerValues = []
    
    reviewerFields.forEach(function(reviewer) {
      var validationMessage = reviewer.parentNode.parentNode.querySelector('.validation-error');
      if(reviewer.value){
        if(reviewerValues.includes(reviewer.value)){
          validationMessage.innerHTML = "Duplicated reviewer address";
          validationMessage.style = "display:block";
          validTargets = false;
        } else {
          var re = /^0x[a-fA-F0-9]{40}$/g;
          if(re.test(reviewer.value)) {
            reviewerValues.push(reviewer.value);
            validationMessage.style = "display:none";
            validReviewers = true;
          } else {
            validationMessage.innerHTML = "This is not a valid ETH address";
            validationMessage.style = "display:block";
            validReviewers = false;
          }
        }
      } else {
        validationMessage.innerHTML = "This is a required field";
        validationMessage.style = "display:block";
        validReviewers = false;
      }
    });
    
    return validName && validReviewFormIndex && validReward && validTargets && validReviewers;
  };

  const addTargetInput = () => {
    var pureG = document.createElement('div');
    pureG.className = "pure-g";
    var pureLabelTargetField = document.createElement('div');
    pureLabelTargetField.className = "pure-u-10-24";
    var pureLabelSeparatorField = document.createElement('div');
    pureLabelSeparatorField.className = "pure-u-1-24";
    var pureLabelHashField = document.createElement('div');
    pureLabelHashField.className = "pure-u-9-24";
    var pureTargetField = document.createElement('div');
    pureTargetField.className = "pure-u-10-24";
    var pureSeparatorField = document.createElement('div');
    pureSeparatorField.className = "pure-u-1-24";
    var pureHashField = document.createElement('div');
    pureHashField.className = "pure-u-9-24";
    var pureValidation = document.createElement('div');
    pureValidation.className = "pure-u-20-24";
    pureG.appendChild(pureLabelTargetField);
    pureG.appendChild(pureLabelSeparatorField);
    pureG.appendChild(pureLabelHashField);
    pureG.appendChild(pureTargetField);
    pureG.appendChild(pureSeparatorField);
    pureG.appendChild(pureHashField);
    
    var targetLabel = document.createElement('label')
    targetLabel.innerHTML = "Target"
    var targetInput = document.createElement('input')
    targetInput.className = "pure-input-1"
    targetInput.type = "text"
    targetInput.placeholder="Enter a target"
    targetInput.name="targets[]"
    pureLabelTargetField.appendChild(targetLabel)
    pureTargetField.appendChild(targetInput)

    var hashLabel = document.createElement('label')
    hashLabel.innerHTML = "Target IPFS Hash"
    var hashInput = document.createElement('input')
    hashInput.className = "pure-input-1"
    hashInput.type = "text"
    hashInput.placeholder="Enter a target IPFS hash"
    hashInput.name="targetsIPFSHashes[]"
    pureLabelHashField.appendChild(hashLabel)
    pureHashField.appendChild(hashInput)
    
    var pureRemove = document.createElement('div');
    pureRemove.className = "pure-u-1-6";
    pureG.appendChild(pureRemove);
    
    var targetRemove = document.createElement('button');
    targetRemove.className = "button-error pure-button"
    targetRemove.onclick = function() { pureG.remove() };
    targetRemove.type = "button";
    targetRemove.innerHTML = "X";
    pureRemove.appendChild(targetRemove);
    
    pureG.appendChild(pureValidation);
    var validationMsg = document.createElement('small');
    validationMsg.className = "validation-error";
    pureValidation.appendChild(validationMsg);
    
    document.getElementById("targetWrapper").appendChild(pureG);
  };
  
  const addReviewerInput = () => {
    var pureG = document.createElement('div');
    pureG.className = "pure-g";
    var pureField = document.createElement('div');
    pureField.className = "pure-u-20-24";
    var pureValidation = document.createElement('div');
    pureValidation.className = "pure-u-20-24";
    pureG.appendChild(pureField);
    
    var reviewerInput = document.createElement('input')
    reviewerInput.className = "pure-input-1"
    reviewerInput.type = "text"
    reviewerInput.placeholder="Enter a reviewer"
    reviewerInput.name="reviewers[]"
    pureField.appendChild(reviewerInput)
    
    var pureRemove = document.createElement('div');
    pureRemove.className = "pure-u-1-6";
    pureG.appendChild(pureRemove);
    
    var reviewerRemove = document.createElement('button');
    reviewerRemove.className = "button-error pure-button"
    reviewerRemove.onclick = function() { pureG.remove() };
    reviewerRemove.type = "button";
    reviewerRemove.innerHTML = "X";
    pureRemove.appendChild(reviewerRemove);
    
    pureG.appendChild(pureValidation);
    var validationMsg = document.createElement('small');
    validationMsg.className = "validation-error";
    pureValidation.appendChild(validationMsg);
    
    document.getElementById("reviewerWrapper").appendChild(pureG);
  };
  
  function removeElement(element) {
    element.remove();
  };

  const populateReviewFormIndexSelect = async () => {
    if (account) {
      try {
        const contract = new web3.eth.Contract(abi, contractAddress, {
          from: account,
        });
        const rfTotal = await contract.methods.reviewFormsTotal().call();
        const noResultsDiv = document.getElementById("no-results-message");
        const createRequestDiv = document.getElementById("create-request-div");
        if(rfTotal > 0) {
          const formIndexDropdown = document.getElementById("reviewFormIndex");
          createRequestDiv.style = "display:block";
          noResultsDiv.style = "display:none";
          let optionsHTML = ''
          for (let i = 0; i < rfTotal; i++) {
            optionsHTML += `<option value="${i}">${i}</option>`;
          }
          formIndexDropdown.innerHTML += optionsHTML;
        } else {
          noResultsDiv.innerHTML = '<strong>There are no Review Forms in the system at this time. <a href="./create_review_form.html">Click here</a> to create a Review Form</strong>'
          noResultsDiv.style = "display:block";
          createRequestDiv.style = "display:none";
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
    .getElementById("createRequestBtn")
    .addEventListener("click", createRequest);
    
    document.getElementById("addTargetsBtn").addEventListener("click", addTargetInput);
    document.getElementById("addReviewersBtn").addEventListener("click", addReviewerInput);
  };