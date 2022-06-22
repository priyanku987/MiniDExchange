/* eslint-disable no-unused-vars */
import { Layout, Row, Col, Card, Tabs, Spin } from 'antd';
import React from 'react';
import TokenSelector from '../Components/TokenSelector';
import Wallet from '../Components/Wallet';
import NewOrder from '../Components/NewOrder';
import AllOrders from '../Components/AllOrders';
import MyOrders from '../Components/MyOrders';
import AllTrades from '../Components/AllTrades';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

export default function Dashboard({
  contracts,
  tokens,
  user,
  selectToken,
  deposit,
  withdraw,
  createMarketOrder,
  createLimitOrder,
  orders,
  fetchingBalances,
  trades,
}) {
  return (
    <Layout className="h-screen">
      <Header>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            className="logo"
            style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}
          >
            Mini DExchange
          </div>
          <div style={{ color: 'white', fontWeight: 800 }}>
            Contract Address:{' '}
            <span style={{ fontWeight: 400 }}>
              {contracts.dex.options.address}
            </span>
          </div>
        </div>
      </Header>
      <Content className="overflow-auto p-8">
        <Spin spinning={fetchingBalances}>
          <Tabs defaultActiveKey="1" style={{ height: '100%' }}>
            <TabPane tab="Controls" key="1">
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <TokenSelector
                    tokens={tokens}
                    user={user}
                    selectToken={selectToken}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col span={12}>
                  <Wallet user={user} deposit={deposit} withdraw={withdraw} />
                </Col>
                {user.selectedToken.ticker !== 'DAI' ? (
                  <Col span={12}>
                    <NewOrder
                      createMarketOrder={createMarketOrder}
                      createLimitOrder={createLimitOrder}
                    />
                  </Col>
                ) : null}
              </Row>
            </TabPane>
            <TabPane tab="Analytics" key="2">
              {user?.selectedToken.ticker !== 'DAI' ? (
                <>
                  <AllTrades trades={trades} />
                  <AllOrders orders={orders} />
                  <MyOrders
                    orders={{
                      buy: orders?.buy?.filter(
                        order =>
                          order.trader.toLowerCase() ===
                          user.accounts[0].toLowerCase(),
                      ),
                      sell: orders?.sell?.filter(
                        order =>
                          order.trader.toLowerCase() ===
                          user.accounts[0].toLowerCase(),
                      ),
                    }}
                  />
                </>
              ) : null}
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    </Layout>
  );
}
