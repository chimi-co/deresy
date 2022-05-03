const closeRequest = async () => {
  if (account) {
    let alertBox = document.getElementById("close-request-info");
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
      
      const _name = document.getElementById("closeRequestName").value;
      
      const validData = validateCloseRequestFields(_name);
      
      if(validData) {
        const data = await contract.methods
        .closeReviewRequest(
          _name,
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
  
  const validateCloseRequestFields = (name, targetIndex, hash) => {
    let validName = false;
    
    var nameValidationMessage = document.getElementById("close-request-name-validation");
    
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
        const reviewRequestNameDropdown = document.getElementById("closeRequestName");
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
    .getElementById("closeRequestBtn")
    .addEventListener("click", closeRequest);
  };