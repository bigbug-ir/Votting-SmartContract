
$(()=>{
    $(window).load(function () {
      PrepareNetwork();
    });
});

let JsonContract = null;
var web3 = null;
let MyContract  = null;
let Owner = null;
let Faz = null;
let CurrentAccount; 

async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
}

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await  ethereum.request({method: 'eth_requestAccounts'}).then(function (accounts) {
          CurrentAccount = accounts[0];
          web3.eth.defaultAccount = CurrentAccount;
          setCurrentAccount();
          });
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

}

async function handleAccountChanged() {
    await  ethereum.request({method: 'eth_requestAccounts'}).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
    });
}

async function handleChainChanged(_chainId) {
    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {
    await $.getJSON('Votting.json',(contractData)=>{
        JsonContract = contractData;
    });
    web3 = await window.web3;
    const networkId = await web3.eth.net.getId();
    const networkData = await JsonContract.networks[networkId];
    if(networkData){
        MyContract = new web3.eth.Contract(JsonContract.abi,networkData.address);

        Owner =await MyContract.methods.Owner().call();
        Faz =await MyContract.methods.fazes().call();
        ShowFaz();
    }
    $(document).on('click','#btn_ActFaz',btn_ActFaz);
    $(document).on('click','#btn_Add',btn_Add);
    $(document).on('click','#Vote',Vote);
    $(document).on('click','#btn_Vote',btn_Vote);
    $(document).on('click','#btn_Win',btn_Win);
}

function setCurrentAccount() {
    $('#AddressFill').text(CurrentAccount);
}

function ShowFaz(){
    if(Faz == 0){
        $('#FazFill').text('Pre Start ======> Please Register Candida with admin...');
    }else if(Faz == 1){
        $('#FazFill').text('Start ======> Please Vote Your Candida...');
    }else{
        $('#FazFill').text(" End ======> Please click Win Candida");
    }
}

function btn_ActFaz(){
    if(Owner.toLowerCase()== CurrentAccount){
        let ConseptFaz = $('#SelectFaz').find(':selected').text();
        let numFaz =0;
        if(ConseptFaz == 'Faz 1: Start'){
            numFaz = 1;
        }else if(ConseptFaz = 'Faz 2: End'){
            numFaz = 2;
        }
        if(numFaz > Faz){
            MyContract.methods.ChangFaz(numFaz).send({from:CurrentAccount}).then((Instanse)=>{
                console.log(Instanse);
            }).catch(error=>{
                console.log(error.message);
            })
            window.location.reload();
        }else{
            alert('You Dont Select This Faz');
        }
    }else{
        alert('You Dont Access this section');
    }
}

function Close(){
    window.location.reload();
}

function btn_Add(){
    if(Owner.toLowerCase() == CurrentAccount){
        if(Faz == 0){
            let name = $('#SetNameCandida').val();
            if(name.trim() ==''){
                alert('Please fill the text box');
                return;
            }
            MyContract.methods.AddCandida(name).send({from:CurrentAccount}).then(Instanse=>{
                console.log(Instanse);
            }).catch(error=>{
                console.log(error.message);
            });
        }else{
            alert('You dont act in this faz');
        }
    }
}

async function Vote(){
    let candidaCount = await MyContract.methods.Counter().call();
    let trHTML = '';
    for(let index = 0 ; index<candidaCount;index++){
        let item = await MyContract.methods.candida(index).call();
        trHTML+=`<tr> <td>${item.id}</td> <td>${item.name}</td> <td>${item.CountVote}</td></tr>`
    }
    $('#location').append(trHTML);
}

function btn_Vote(){
    let nameCandida = $('#nameCandida').val();
    let idCandida = $('#idCandida').val();
    console.log(nameCandida,idCandida);
    if(nameCandida.trim() == '' || idCandida.trim() == '' ){
        alert("Please Fill the TextBox");
        return;
    }
    if(Faz == 1 ){
        MyContract.methods.VottingCandida(nameCandida,idCandida).send({from:CurrentAccount}).then(Instanse=>{
            console.log(Instanse);
        }).catch(error=>{
            console.log(error.message);
        })
    }else{
        alert("You Don't Act this Faz...");
    }
}

async function btn_Win(){
    if(Faz == 2){
        let winner = await MyContract.methods.WinCandida().call();
        $('#WinFill').text(`======> Name : ${winner[1]} with id : ${winner[0]}`);
    }else{
        alert('You Dont Act this Faz...');
    }
}