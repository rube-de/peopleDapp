var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0xe6b7922fBab5E0028CDCe3af2E3edaE1FdB72771", {from: accounts[0]});
        console.log(contractInstance);
    });
    $("#add_data_button").click(inputData);
    $("#get_data_button").click(fetchAndDisplayData);
});

function inputData(){
    var name = $("#name_input").val();
    var age = $("#age_input").val();
    var height = $("#height_input").val();

    var config = {
        value: web3.utils.toWei("1", "ether")
    }

    contractInstance.methods.createPerson(name,age,height).send(config)
        .on("transactionHash", hash => {
            console.log("hash: " + hash);
        })
        .on("confirmation", confirmationNr => {
            console.log("confirmation: " + confirmationNr);
        })
        .on("receipt", receipt =>{
            console.log("receip: " + receipt);
        });
}

function fetchAndDisplayData(){
    contractInstance.methods.getPerson().call().then(function (res) {
        $("#name_output").text(res.name);
        $("#age_output").text(res.age);
        $("#height_output").text(res.height);
        
    });
}
