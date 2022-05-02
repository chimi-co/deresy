const submitReview = async () => {
  if (account) {
    try {
      const { eth } = web3;
      const contract = new eth.Contract(abi, contractAddress, {
        from: account,
      });
      const provider = web3.currentProvider.isMetaMask;
      
      const _name = document.getElementById("submit-review-name").value;
      const submitTargetIndex = document.getElementById("submit-review-target-index").value;
      const answersValues = [];
      const answers = document.getElementsByClassName('submit-review-answers');
      for(let answer of answers) {
        if (answer.type == "radio") {
          if(answer.checked) {
            answersValues.push(answer.value);
          }
        } else {
          answersValues.push(answer.value);
        }
      };

      const validData = validateSubmitReviewFields(_name, submitTargetIndex);
      
      if(validData) {
        const data = await contract.methods
        .submitReview(
          _name,
          submitTargetIndex,
          answersValues,
          )
          .encodeABI();
          
          const transaction = {
            from: account,
            to: contractAddress,
            data,
          };
          
          await web3.eth
          .sendTransaction(transaction)
          .on("transactionHash", (txHash) => {
            document.getElementById("submit-review-info").innerHTML = "In Progress...";
          })
          .on("receipt", function (receipt) {
            document.getElementById("submit-review-info").innerHTML = "Successful...";
          })
          .on("error", console.error);
        }
      } catch (error) {
        document.getElementById("submit-review-info").innerHTML = "error...";
        if (error.code === 4001) {
          document.getElementById("submit-review-info").innerHTML =
          "user rejected transaction...";
        }
        throw error;
      }
    }
  };
  
  const validateSubmitReviewFields = (name, targetIndex) => {
    let validName = false;
    let validTargetIndex = false;
    let validAnswers = false;
    
    var nameValidationMessage = document.getElementById("submit-review-name-validation");
    var targetIndexValidationMessage = document.getElementById("submit-review-target-index-validation");
    
    if(name) {
      nameValidationMessage.style = "display:none";
      validName = true;
    } else {
      nameValidationMessage.innerHTML = "This is a required field";
      nameValidationMessage.style = "display:block";
      validName = false;
    }
    
    if(targetIndex) {
      targetIndexValidationMessage.style = "display:none";
      validTargetIndex = true;
    } else {
      targetIndexValidationMessage.innerHTML = "This is a required field";
      targetIndexValidationMessage.style = "display:block";
      validTargetIndex = false;
    }
    
    answers = document.getElementsByClassName('submit-review-answers');
    for(let answer of answers) {
      var validationMessage = answer.type == "radio" ?  answer.parentNode.parentNode.parentNode.querySelector('.validation-error') : answer.parentNode.parentNode.querySelector('.validation-error');
      if(answer.value){
        validationMessage.style = "display:none";
        validAnswers = true;
      } else {
        validationMessage.innerHTML = "This is a required field";
        validationMessage.style = "display:block";
        validAnswers = false;
      }
    };
    
    return validName && validTargetIndex && validAnswers;
  };

  async function getRequestQuestions() {
    if (account) {
      try {
        const reviewName = document.getElementById("submit-review-name").value;
        
        const validData = validateGetRequestQuestions(reviewName);
        
        if(validData) {
          const contract = new web3.eth.Contract(abi, contractAddress, {
            from: account,
          });
          const reviewRequest = await contract.methods.getRequest(reviewName).call();
          const requestTargets = reviewRequest.targets;
          const reviewFormIndex = reviewRequest.reviewFormIndex;
          const reviewForm = await contract.methods.getReviewForm(reviewFormIndex).call();
          const questions = reviewForm[0]
          const questionTypes = reviewForm[1]
          
          let questionsHTML = `<label>Target</label><div class="pure-g"><div class="pure-u-20-24"><select id="submit-review-target-index" class="pure-input-1"><option hidden selected value="">Select the target for your review</option><select/></div><div class="pure-u-20-24"><small id="submit-review-target-index-validation" class="validation-error"></small></div></div>`
          
          questionTypes.forEach( (questionType,index) => {
            questionsHTML += questionType == 0 ?  createTextQuestion(questions[index]) : createCheckboxQuestion(questions[index], index);
          });
          document.getElementById("submit-review-questions-wrapper").innerHTML = questionsHTML;
          document.getElementById("submit-review-questions-wrapper").style = "display:block";
          
          const targetIndexSelect = document.getElementById('submit-review-target-index');
          for (let i = 0; i < requestTargets.length; i++) {
            targetIndexSelect.innerHTML += `<option value="${i}">${requestTargets[i]}</option>`;
          }
        }
      } catch (error) {
        throw error;
      }
    }
  };
  
  const validateGetRequestQuestions = (name) => {
    let validName = false;
    
    var nameValidationMessage = document.getElementById("submit-review-name-validation");
    
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
  
  function createTextQuestion(question) {
    let questionHTML = `<label>${question}</label><div class="pure-g"><div class="pure-u-20-24"><textarea class="submit-review-answers" class="pure-input-1" type="text" placeholder="Enter your answer" rows="4" cols="90"></textarea></div><div class="pure-u-20-24"><small class="validation-error"></small></div></div><br/>`;  
    return questionHTML;
  };
  
  function createCheckboxQuestion(question, index) {
    let questionHTML = `<label>${question}</label><div class="pure-g"><div class="pure-u-10-24"><label for="radio-1-${index}" class="pure-checkbox""><input type="radio" class="submit-review-answers" name="checkbox-answers-${index}" id="radio-1-${index}" value="Yes" style="width:20px !important" checked />Yes</label></div><div class="pure-u-10-24"><label for="radio-2-${index}" class="pure-checkbox"><input type="radio" name="checkbox-answers-${index}" class="submit-review-answers" id="radio-2-${index}" value="No" style="width:20px !important"/>No</label></div><div class="pure-u-20-24"><small class="validation-error"></small></div></div><br/>`;
    return questionHTML;
  };

  const populateReviewRequestNameSelect = async () => {
    if (account) {
      try {
        const contract = new web3.eth.Contract(abi, contractAddress, {
          from: account,
        });
        
        const rrNames = await contract.methods.getReviewRequestsNames().call();
        const reviewRequestNameDropdown = document.getElementById("submit-review-name");
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

  const resetSubmitQuestions = () => {
    document.getElementById("submit-review-questions-wrapper").style = "display:none"
  };

  var prev_onLoad = window.onload;

  window.onload = async function () {
    if (typeof(prev_onLoad)=='function')
      prev_onLoad();
      
    document
    .getElementById("submitReviewBtn")
    .addEventListener("click", submitReview);
    
    document.getElementById("getRequestQuestionsBtn").addEventListener("click", getRequestQuestions);
    document.getElementById("submit-review-name").addEventListener("onchange", resetSubmitQuestions);
  };