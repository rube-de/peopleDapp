const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function(){
    let instance;
    before(async function(){
        instance = await People.deployed();
    });
    it("shouldn't create a person with age over 150 years", async function(){
        await truffleAssert.fails(instance.createPerson("Bob", 200, 190, {value: web3.utils.toWei("1","ether")}), truffleAssert.ErrorType.REVERT);
    });
    it("shouldn't create a person without payment", async function(){
        await truffleAssert.fails(instance.createPerson("Bob", 50, 150, {value: 1000}), truffleAssert.ErrorType.REVERT);
    });
    it("should set senior status correctly", async function (){
        await instance.createPerson("Bob", 80, 190, {value: web3.utils.toWei("1","ether")});
        let result = await instance.getPerson();
        assert(result.senior === true, "Senior level not set");
    })
});
contract("People", async function(accounts){
    let instance;
    beforeEach(async function(){
        instance = await People.new();
    });
    it("shouldn't delete person when I'm not the owner ", async function(){
        await instance.createPerson("Bob", 80, 190, {value: web3.utils.toWei("1","ether"), from: accounts[2]});
        await truffleAssert.fails(instance.deletePerson(accounts[2], {from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });
    it("should allow delete person when I'm the owner ", async function(){
        await instance.createPerson("Bob", 80, 190, {value: web3.utils.toWei("1","ether"), from: accounts[1]});
        await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
    });
    it("should let onwer allow withdraw balance", async function(){
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
    });
    it("shouldn't let nonowner allow withdraw balance", async function(){
        await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}),truffleAssert.ErrorType.REVERT);
    });
    it("owner balance should increase after withdrawal", async function(){
        await instance.createPerson("Bob", 80, 190, {value: web3.utils.toWei("1","ether"), from: accounts[1]});
        let ownerOldBalance =  parseFloat(await web3.eth.getBalance(accounts[0]));
        await instance.withdrawAll();
        let ownerNewBalance =  parseFloat(await web3.eth.getBalance(accounts[0]));
        assert(ownerNewBalance > ownerOldBalance, "balance didn't increase")
    });
    it("should reset balance to 0 after withdrawal", async function(){
        await instance.createPerson("Bob", 80, 190, {value: web3.utils.toWei("1","ether"), from: accounts[1]});
        await instance.withdrawAll();
        let balance = parseFloat(await instance.balance());
        let networkBalance = parseFloat(await web3.eth.getBalance(instance.address));
        assert(balance == networkBalance, "network and local balance doesn't match");
        assert(balance == 0, "local balance isn't 0");
        assert(networkBalance == 0, "network balance isn't 0");

    });
    it("should increase balance correctly when adding a person", async function() {
        let oldBalance = parseFloat(await instance.balance());
        await instance.createPerson("Bob", 80, 190, {value: web3.utils.toWei("1","ether"), from: accounts[1]});
        let newBalance = parseFloat(await instance.balance());
        let networkBalance = parseFloat(await web3.eth.getBalance(instance.address));
        assert(newBalance == oldBalance + web3.utils.toWei("1","ether"), "Balance didn't increased by 1");
        assert(newBalance == networkBalance, "local and network balance didn't update correctly");
    });
});