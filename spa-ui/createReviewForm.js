const createReviewForm = async () => {
  if (account) {
    let alertBox = document.getElementById("create-review-form-info");
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
      
      const questions = Array.prototype.slice.call(document.getElementsByName('questions[]'));
      const questionsValues = questions.map((o) => o.value);
      const questionTypes = Array.prototype.slice.call(document.getElementsByName('question-types[]'));
      const questionTypesValues = questionTypes.map((o) => o.value);
      
      let questionsChoicesValues = []
      questions.forEach((question, index) => {
        let choicesValues = []
        if(questionTypesValues[index] == 2){
          let questionChoices = Array.prototype.slice.call(question.parentElement.parentElement.querySelectorAll('[name="choices[]"]'))
          choicesValues = questionChoices.map((o) => o.value);
        }
        questionsChoicesValues.push(choicesValues);
      })

      const validData = validateCreateReviewForm();

      if(validData) {
        const data = await contract.methods
        .createReviewForm(
          questionsValues,
          questionsChoicesValues,
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
        throw error;
      }
    }
  };
  
  const validateCreateReviewForm = () => {
    let validQuestions = false;
    let validQuestionTypes = false;
    let validQuestionChoices = true;
    
    let questionFields = document.getElementsByName('questions[]');
    
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
    
    let questionTypeFields = document.getElementsByName('question-types[]');
    
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
      if(questionType.value == 2) {
        let questionChoices = questionType.parentNode.parentNode.querySelectorAll('[name="choices[]"]');
        questionChoices.forEach(function(choice){
          var validationMessage = choice.parentNode.parentNode.querySelector('.choice-validation');
          if(choice.value){
            validationMessage.style = "display:none";
          } else {
            validationMessage.innerHTML = "This is a required field";
            validationMessage.style = "display:block";
            validQuestionChoices = false;
          }
        });
      }
    });

    
    return validQuestions && validQuestionTypes && validQuestionChoices;
  };

  const questionTypeSelected = (selector, typeValue) => {
    const questionWrapper = selector.parentNode.parentNode;
    if(typeValue == 2) {
      var scQuestionWrapper = document.createElement('div');
      scQuestionWrapper.className = "pure-u-1 single-choice-question-wrapper";
      var scChoicesWrapper = document.createElement('div');
      scChoicesWrapper.className = "pure-u-1 single-choice-choices-wrapper";
      scQuestionWrapper.appendChild(scChoicesWrapper);
      questionWrapper.appendChild(scQuestionWrapper);

      var choice1PureG = document.createElement('div')
      choice1PureG.className = "pure-g"
      var choice1Div = document.createElement('div')
      choice1Div.className = "pure-u-19-24"
      var choice1Validation = document.createElement('div')
      choice1Validation.className = "pure-u-19-24"
      var choice2PureG = document.createElement('div')
      choice2PureG.className = "pure-g"
      var choice2Div = document.createElement('div')
      choice2Div.className = "pure-u-19-24"
      var choice2Validation = document.createElement('div')
      choice2Validation.className = "pure-u-19-24"
      var choiceInput1 = document.createElement('input')
      choiceInput1.className = "pure-input-1"
      choiceInput1.type = "text"
      choiceInput1.placeholder="Enter the choice text"
      choiceInput1.name="choices[]"
      var choice1ValidationMessage = document.createElement('small')
      choice1ValidationMessage.className = "validation-error choice-validation"
      var choiceInput2 = document.createElement('input')
      choiceInput2.className = "pure-input-1"
      choiceInput2.type = "text"
      choiceInput2.placeholder="Enter the choice text"
      choiceInput2.name="choices[]"
      var choice2ValidationMessage = document.createElement('small')
      choice2ValidationMessage.className = "validation-error choice-validation"

      choice1Div.appendChild(choiceInput1)
      choice2Div.appendChild(choiceInput2)
      choice1Validation.appendChild(choice1ValidationMessage)
      choice2Validation.appendChild(choice2ValidationMessage)
      choice1PureG.appendChild(choice1Div)
      choice2PureG.appendChild(choice2Div)
      choice1PureG.appendChild(choice1Validation)
      choice2PureG.appendChild(choice2Validation)
      scChoicesWrapper.appendChild(choice1PureG);
      scChoicesWrapper.appendChild(choice2PureG);
      
      var choicesBtn = document.createElement('button');
      choicesBtn.className = "pure-button button-warning"
      choicesBtn.onclick = function() { addQuestionChoice(this) };
      choicesBtn.type = "button";
      choicesBtn.innerHTML = "Add Choice";
      scQuestionWrapper.appendChild(choicesBtn);
    } else {
      var scQuestionWrapper = questionWrapper.querySelector(".single-choice-question-wrapper");
      if(scQuestionWrapper){
        scQuestionWrapper.remove();
      }
    }
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
    questionTypeSelect.onchange = function() { questionTypeSelected(questionTypeSelect, this.value) }
    var selectPlaceholder = document.createElement('option')
    selectPlaceholder.innerHTML = "Select a question type"
    selectPlaceholder.hidden = true
    selectPlaceholder.selected = true
    selectPlaceholder.value = ""
    var selectOpt1 = document.createElement('option')
    selectOpt1.innerHTML = "Text"
    selectOpt1.value = "0"
    var selectOpt2 = document.createElement('option')
    selectOpt2.innerHTML = "Yes/No"
    selectOpt2.value = "1"
    var selectOpt3 = document.createElement('option')
    selectOpt3.innerHTML = "Single Choice"
    selectOpt3.value = "2"
    questionTypeSelect.appendChild(selectPlaceholder)
    questionTypeSelect.appendChild(selectOpt1)
    questionTypeSelect.appendChild(selectOpt2)
    questionTypeSelect.appendChild(selectOpt3)
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

  const addQuestionChoice = (selector) => {
    let choicesWrapper = selector.parentNode.parentNode.querySelector(".single-choice-choices-wrapper")
    var pureG = document.createElement('div');
    pureG.className = "pure-g";

    var pureChoiceField = document.createElement('div');
    pureChoiceField.className = "pure-u-19-24";
    var pureSeparator = document.createElement('div');
    pureSeparator.className = "pure-u-1-24";
    var pureRemove = document.createElement('div');
    pureRemove.className = "pure-u-1-6";
    var choiceValidationDiv = document.createElement('div');
    choiceValidationDiv.className = "pure-u-19-24";

    var questionChoiceInput = document.createElement('input');
    questionChoiceInput.className = "pure-input-1";
    questionChoiceInput.type = "text";
    questionChoiceInput.placeholder="Enter the choice text";
    questionChoiceInput.name="choices[]";
    pureChoiceField.appendChild(questionChoiceInput);

    var choiceValidationMessage = document.createElement('small');
    choiceValidationMessage.className = "validation-error choice-validation";
    choiceValidationDiv.appendChild(choiceValidationMessage);

    var questionRemove = document.createElement('button');
    questionRemove.className = "button-error pure-button"
    questionRemove.onclick = function() { pureG.remove() };
    questionRemove.type = "button";
    questionRemove.innerHTML = "X";
    pureRemove.appendChild(questionRemove);

    pureG.appendChild(pureChoiceField);
    pureG.appendChild(pureSeparator);
    pureG.appendChild(pureRemove);
    pureG.appendChild(choiceValidationDiv);

    choicesWrapper.appendChild(pureG);
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

    document
    .getElementById("question-type-selector")
    .addEventListener('change', function() { questionTypeSelected(this, this.value) });
    
    document.getElementById("addQuestionBtn").addEventListener("click", addQuestion);
  };