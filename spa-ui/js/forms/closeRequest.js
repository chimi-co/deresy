const closeRequest = async () => {
  if (account) {
    try {
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
            document.getElementById("close-request-info").innerHTML = "In Progress...";
          })
          .on("receipt", function (receipt) {
            document.getElementById("close-request-info").innerHTML = "Successful...";
          })
          .on("error", console.error);
        }
      } catch (error) {
        document.getElementById("close-request-info").innerHTML = "error...";
        if (error.code === 4001) {
          document.getElementById("close-request-info").innerHTML =
          "user rejected transaction...";
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

  var prev_onLoad = window.onload;

  window.onload = async function () {
    if (typeof(prev_onLoad)=='function')
      prev_onLoad();
      
    document
    .getElementById("closeRequestBtn")
    .addEventListener("click", closeRequest);
  };