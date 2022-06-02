const { assert } = require("console");
const {expectRevert} = require('@openzeppelin/test-helpers')

const Wallet = artifacts.require('Wallet')

contract("Wallet", (accounts) => {
    let wallet;
    beforeEach(async () => {
        wallet = await Wallet.new(
            [accounts[0], accounts[1],accounts[2]],
            2
        )
        await web3.eth.sendTransaction({from : accounts[0], to : wallet.address, value : 1000}) //value is in wei
    })

    it('should have correct approvers and quorum', async () => {
        const approvers = await wallet.get_approvers()
        const quorum = await wallet.quorum()
        assert(approvers.length  ===  3)
        assert(approvers[0] === accounts[0])
        assert(approvers[1] === accounts[1])
        assert(approvers[2] === accounts[2])
        assert(quorum.toNumber() === 2)

    })

    it('should create transfer', async () => {
        await wallet.create_transfer(100, accounts[5], {from : accounts[0]})
        const transfers = await wallet.get_transfers()
        assert(transfers.length === 1)
        assert(transfers[0].id === '0')
        assert(transfers[0].amount === '100')
        assert(transfers[0].to === accounts[5])
        assert(transfers[0].approvals === '0')
        assert(transfers[0].sent === false)
    })

    it('should not create transfers if sender is not approved', async () => {
        await expectRevert(wallet.create_transfer(100, accounts[5], {from : accounts[4]}), 'Only Approver allowed')
    })

    it('should increment approvals', async () => {
        await wallet.create_transfer(100,accounts[5], {from: accounts[0]})
        await wallet.approve_transfer(0, {from: accounts[0]})
    })
})