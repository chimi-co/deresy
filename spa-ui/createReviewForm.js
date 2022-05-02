const createReviewForm = async () => {
  if (account) {
    try {
      const { eth } = web3;
      const contract = new eth.Contract(abi, contractAddress, {
        from: account,
      });
      const provider = web3.currentProvider.isMetaMask;
      
      const questions = Array.prototype.slice.call(document.getElementsByName('questions[]'));
      const questionsValues = questions.map((o) => o.value);
      const questionTypes = Array.prototype.slice.call(document.getElementsByName('question-types[]'));
      const questionTypesValues = questionTypes.map((o) => o.value);
      
      
      const validData = validateCreateReviewForm();
      
      if(validData) {
        const data = await contract.methods
        .createReviewForm(
          questionsValues,
          questionTypesValues,
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
            document.getElementById("create-review-form-info").innerHTML = "In Progress...";
          })
          .on("receipt", function (receipt) {
            document.getElementById("create-review-form-info").innerHTML = "Successful...";
          })
          .on("error", console.error);
        }
      } catch (error) {
        document.getElementById("create-review-form-info").innerHTML = "error...";
        if (error.code === 4001) {
          document.getElementById("create-review-form-info").innerHTML =
          "user rejected transaction...";
        }
        throw error;
      }
    }
  };
  
  const validateCreateReviewForm = (name, targetIndex, hash) => {
    let validQuestions = false;
    let validQuestionTypes = false;
    
    questionFields = document.getElementsByName('questions[]');
    
    questionFields.forEach(function(question) {
      var validationMessage = question.parentNode.parentNode.querySelector('.question-validation');
      if(question.value){
        validationMessage.style = "display:none";
        validQuestions = true;
      } else {
        validationMessage.innerHTML = "This is a required field";
        validationMessage.style = "display:block";
        validQuestions = false;
      }
    });
    
    questionTypeFields = document.getElementsByName('question-types[]');
    
    questionTypeFields.forEach(function(questionType) {
      var validationMessage = questionType.parentNode.parentNode.querySelector('.question-type-validation');
      if(questionType.value){
        validationMessage.style = "display:none";
        validQuestionTypes = true;
      } else {
        validationMessage.innerHTML = "This is a required field";
        validationMessage.style = "display:block";
        validQuestionTypes = false;
      }
    });
    
    return validQuestions && validQuestionTypes;
  };

  const addQuestion = () => {
    var pureG = document.createElement('div');
    pureG.className = "pure-g";
    
    var pureQuestionFieldLabel = document.createElement('div');
    pureQuestionFieldLabel.className = "pure-u-5-12";
    var pureQuestionFieldLabelSeparator1 = document.createElement('div');
    pureQuestionFieldLabelSeparator1.className = "pure-u-1-24";
    var pureQuestionTypeFieldLabel = document.createElement('div');
    pureQuestionTypeFieldLabel.className = "pure-u-1-3";
    var pureQuestionFieldLabelSeparator2 = document.createElement('div');
    pureQuestionFieldLabelSeparator2.className = "pure-u-1-6";
    
    var pureQuestionField = document.createElement('div');
    pureQuestionField.className = "pure-u-5-12";
    var pureSeparator = document.createElement('div');
    pureSeparator.className = "pure-u-1-24";
    var pureQuestionTypeField = document.createElement('div');
    pureQuestionTypeField.className = "pure-u-1-3";
    var pureSeparator2 = document.createElement('div');
    pureSeparator2.className = "pure-u-1-24";
    var pureRemove = document.createElement('div');
    pureRemove.className = "pure-u-1-8";
    
    var pureQuestionFieldValidation = document.createElement('div');
    pureQuestionFieldValidation.className = "pure-u-5-12";
    var pureQuestionFieldValidationSeparator1 = document.createElement('div');
    pureQuestionFieldValidationSeparator1.className = "pure-u-1-24";
    var pureQuestionTypeFieldValidation = document.createElement('div');
    pureQuestionTypeFieldValidation.className = "pure-u-1-3";
    var pureQuestionFieldValidationSeparator2 = document.createElement('div');
    pureQuestionFieldValidationSeparator2.className = "pure-u-1-6";
    
    pureG.appendChild(pureQuestionFieldLabel);
    pureG.appendChild(pureQuestionFieldLabelSeparator1);
    pureG.appendChild(pureQuestionTypeFieldLabel);
    pureG.appendChild(pureQuestionFieldLabelSeparator2);
    pureG.appendChild(pureQuestionField);
    pureG.appendChild(pureSeparator);
    pureG.appendChild(pureQuestionTypeField);
    pureG.appendChild(pureSeparator2);
    pureG.appendChild(pureRemove);
    pureG.appendChild(pureQuestionFieldValidation);
    pureG.appendChild(pureQuestionFieldValidationSeparator1);
    pureG.appendChild(pureQuestionTypeFieldValidation);
    pureG.appendChild(pureQuestionFieldValidationSeparator2);
    
    var questionLabel = document.createElement('label')
    questionLabel.innerHTML = "Question"
    var questionInput = document.createElement('input')
    questionInput.className = "pure-input-1"
    questionInput.type = "text"
    questionInput.placeholder="Enter a question"
    questionInput.name="questions[]"
    pureQuestionFieldLabel.appendChild(questionLabel)
    pureQuestionField.appendChild(questionInput)
    
    
    var questionTypeLabel = document.createElement('label')
    questionTypeLabel.innerHTML = "Question Type"
    var questionTypeSelect = document.createElement('select')
    questionTypeSelect.className = "pure-input-1"
    questionTypeSelect.name = "question-types[]"
    var selectPlaceholder = document.createElement('option')
    selectPlaceholder.innerHTML = "Select a question type"
    selectPlaceholder.hidden = true
    selectPlaceholder.selected = true
    selectPlaceholder.value = ""
    var selectOpt1 = document.createElement('option')
    selectOpt1.innerHTML = "Text"
    selectOpt1.value = "0"
    var selectOpt2 = document.createElement('option')
    selectOpt2.innerHTML = "Checkbox"
    selectOpt2.value = "1"
    questionTypeSelect.appendChild(selectPlaceholder)
    questionTypeSelect.appendChild(selectOpt1)
    questionTypeSelect.appendChild(selectOpt2)
    pureQuestionTypeFieldLabel.appendChild(questionTypeLabel)
    pureQuestionTypeField.appendChild(questionTypeSelect)
    
    var questionRemove = document.createElement('button');
    questionRemove.className = "button-error pure-button"
    questionRemove.onclick = function() { pureG.remove() };
    questionRemove.type = "button";
    questionRemove.innerHTML = "X";
    pureRemove.appendChild(questionRemove);
    
    var questionValidationMessage = document.createElement('small');
    questionValidationMessage.className = "validation-error question-validation";
    pureQuestionFieldValidation.appendChild(questionValidationMessage);
    
    var questionTypeValidationMessage = document.createElement('small');
    questionTypeValidationMessage.className = "validation-error question-type-validation";
    pureQuestionTypeFieldValidation.appendChild(questionTypeValidationMessage);
    
    document.getElementById("questionWrapper").appendChild(pureG);
  };

  function removeElement(element) {
    element.remove();
  };

  var prev_onLoad = window.onload;

  window.onload = async function () {
    if (typeof(prev_onLoad)=='function')
      prev_onLoad();

    document
    .getElementById("createReviewFormBtn")
    .addEventListener("click", createReviewForm);
    
    document.getElementById("addQuestionBtn").addEventListener("click", addQuestion);
  };