const { expectRevert } = require("@openzeppelin/test-helpers")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")

const Dai = artifacts.require('mocks/Dai.sol')
const Bat = artifacts.require('mocks/Bat.sol')
const Rep = artifacts.require('mocks/Rep.sol')
const Zrx = artifacts.require('mocks/Zrx.sol')
const Dex = artifacts.require('Dex.sol')

const SIDE = {
    BUY: 0,
    SELL: 1
}

contract('Dex', (accounts) => {
    let dai, bat, rep, zrx, dex;
    const [trader1, trader2] = [accounts[1], accounts[2]]
    const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX'].map(ticker => web3.utils.fromAscii(ticker))
    
    beforeEach(async () => {
        ([dai, bat, rep, zrx]=await Promise.all([Dai.new(), Bat.new(), Rep.new(), Zrx.new()]));
        dex = await Dex.new()
        await Promise.all([dex.add_token(DAI, dai.address), dex.add_token(BAT, bat.address), dex.add_token(REP, rep.address), dex.add_token(ZRX, zrx.address)])
        const amount = web3.utils.toWei('1000')
        const seedTokenBalance = async (token, trader) => {
            await token.faucet(trader, amount)
            await token.approve(dex.address, amount, {from:trader})
        }

        // Seeds inital token balances to each trader
        await Promise.all([dai, bat, rep, zrx].map(token => seedTokenBalance(token, trader1)))
        await Promise.all([dai, bat, rep, zrx].map(token => seedTokenBalance(token, trader2)))
        // expect(a).to.equal('promise resolved'); 
    })

    it('should deposit ERC20 tokens', async () => {
        const amount = web3.utils.toWei('100')
        await dex.deposit(amount, DAI, {from: trader1})
        const balance = await dex.trader_balances(trader1, DAI)
        assert(balance.toString() === amount);
    })

    it("should not deposit token if token doesnot exist", async () => {
        await expectRevert(dex.deposit(web3.utils.toWei('100'), web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'), {from: trader1}), 'Token doesnot exist')
    })

    it("should withdraw tokens", async () => {
        const amount = web3.utils.toWei('100')
        await dex.deposit(amount, DAI, {from: trader1})
        await dex.withdraw(amount, DAI, {from: trader1})

        const [balance_dex, balance_dai]=await Promise.all([dex.trader_balances(trader1, DAI) /**token balance from dex */, dai.balanceOf(trader1)/**token balance on dai smart contract */])
        assert(balance_dex.isZero())
        assert(balance_dai.toString() == web3.utils.toWei('1000'))
    })

    it('should not withdraw tokens if token doesnot exist', async () => {
        await expectRevert(dex.deposit(web3.utils.toWei('100'), web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'), {from: trader1}), 'Token doesnot exist')
    })

    it('should not withdraw tokens if balance is too low', async () => {
        const amount = web3.utils.toWei('100')
        await dex.deposit(amount, DAI, {from: trader1})
        await expectRevert(dex.withdraw(web3.utils.toWei('1000'), DAI, {from: trader1}), 'Insufficient Balance')
    })

    it("should create limit order", async () => {
        //Deposit 100 Dai in smart contract
        const amount = web3.utils.toWei('100')
        await dex.deposit(amount, DAI, {from: trader1})

        // Create limit order for Rep token
        await dex.create_limit_order(REP, web3.utils.toWei('10'), 10, SIDE.BUY, {from: trader1})

        // Inspect order book and find the order
        let buyOrders =  await dex.get_orders(REP, SIDE.BUY)
        let sellOrders = await dex.get_orders(REP, SIDE.SELL)

        assert(buyOrders.length ===1)
        assert(buyOrders[0].trader === trader1)
        assert(buyOrders[0].ticker === web3.utils.padRight(REP, 64))
        assert(buyOrders[0].price === '10')
        assert(buyOrders[0].amount === web3.utils.toWei('10'))
        assert(sellOrders.length === 0)

        //Deposit 100 Dai in smart contract
        const amount2 = web3.utils.toWei('200')
        await dex.deposit(amount2, DAI, {from: trader2})

        // Create limit order for Rep token
        await dex.create_limit_order(REP, web3.utils.toWei('10'), 11, SIDE.BUY, {from: trader2})

        // Inspect order book and find the order
         buyOrders =  await dex.get_orders(REP, SIDE.BUY)
         sellOrders = await dex.get_orders(REP, SIDE.SELL)

        assert(buyOrders.length ===2)
        assert(buyOrders[0].trader === trader2)
        assert(buyOrders[1].trader === trader1)
        assert(sellOrders.length === 0)

        // Create limit order for Rep token
        await dex.create_limit_order(REP, web3.utils.toWei('10'), 9, SIDE.BUY, {from: trader2})
        // Inspect order book and find the order
        buyOrders =  await dex.get_orders(REP, SIDE.BUY)
        sellOrders = await dex.get_orders(REP, SIDE.SELL)
        assert(buyOrders.length === 3)
        assert(buyOrders[0].trader === trader2)
        assert(buyOrders[1].trader === trader1)
        assert(buyOrders[2].trader === trader2)
        assert(buyOrders[2].price === '9')
        assert(sellOrders.length === 0)
    })

    it("should not create limit order if token doesnot exist", async () => {
        await expectRevert(dex.create_limit_order(
            web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
            web3.utils.toWei('1000'),
            10,
            SIDE.BUY,
            {from: trader1}
        ), 'Token doesnot exist')
    })

    it("should not create limit order if token is DAI", async () => {
        await expectRevert(dex.create_limit_order(
            DAI,
            web3.utils.toWei('1000'),
            10,
            SIDE.BUY,
            {from: trader1}
        ), 'Cannot trade DAI')
    })

    it("should not create limit order if token balance is low", async () => {
        await dex.deposit(
            web3.utils.toWei('99'),
            REP,
            {from: trader1}
        )

        await expectRevert(dex.create_limit_order(
            REP,
            web3.utils.toWei('100'),
            10,
            SIDE.SELL,
            {from: trader1}
        ), 'Insufficient Balance')
    })

    it("should not create limit order if DAI balance is low", async () => {
        await dex.deposit(
            web3.utils.toWei('99'),
            DAI,
            {from: trader1}
        )

        await expectRevert(dex.create_limit_order(
            REP,
            web3.utils.toWei('10'),
            10,
            SIDE.BUY,
            {from: trader1}
        ), 'DAI Balance too low')
    })
})