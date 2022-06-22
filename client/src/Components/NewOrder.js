/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Radio,
  InputNumber,
  Button,
} from 'antd';

const { Title, Text } = Typography;

const TYPE = {
  LIMIT: 'LIMIT',
  MARKET: 'MARKET',
};

const SIDE = {
  BUY: 0,
  SELL: 1,
};

export default function NewOrder({ createMarketOrder, createLimitOrder }) {
  const [order, setOrder] = useState({
    type: TYPE.LIMIT,
    side: SIDE.BUY,
    amount: '',
    price: '',
  });

  const submit = () => {
    console.log('order', order);
    if (order.type === TYPE.MARKET) {
      createMarketOrder(order.amount, order.side);
    } else {
      createLimitOrder(order.amount, order.price, order.side);
    }
  };
  return (
    <Card hoverable style={{ borderRadius: '8px', height: '440px' }} bordered>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={3}>New Order</Title>
          <Divider style={{ marginTop: '0px', marginBottom: '0px' }} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={10}>
          <Text style={{ color: '#001628' }}>Type</Text>
        </Col>
        <Col span={14}>
          <Radio.Group
            defaultValue={order?.type}
            value={order?.type}
            buttonStyle="solid"
            style={{ width: '100%' }}
            onChange={e =>
              setOrder(_order => ({ ..._order, type: e.target.value }))
            }
          >
            <Radio.Button
              value="LIMIT"
              style={{ width: '50%', textAlign: 'center' }}
            >
              Limit
            </Radio.Button>
            <Radio.Button
              value="MARKET"
              style={{ width: '50%', textAlign: 'center' }}
            >
              Market
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={10}>
          <Text style={{ color: '#001628' }}>Side</Text>
        </Col>
        <Col span={14}>
          <Radio.Group
            defaultValue={order?.side}
            buttonStyle="solid"
            style={{ width: '100%' }}
            value={order?.side}
            onChange={e =>
              setOrder(_order => ({ ..._order, side: e.target.value }))
            }
          >
            <Radio.Button
              value={0}
              style={{ width: '50%', textAlign: 'center' }}
            >
              Buy
            </Radio.Button>
            <Radio.Button
              value={1}
              style={{ width: '50%', textAlign: 'center' }}
            >
              Sell
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={10}>
          <Text style={{ color: '#001628' }}>Amount</Text>
        </Col>
        <Col span={14}>
          <InputNumber
            // addonAfter={user?.selectedToken?.ticker}
            defaultValue={order?.amount}
            style={{ width: '100%' }}
            placeholder="1"
            value={order?.amount}
            onChange={val => setOrder(_order => ({ ..._order, amount: val }))}
          />
        </Col>
      </Row>

      {order?.type === 'MARKET' ? null : (
        <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
          <Col span={10}>
            <Text style={{ color: '#001628' }}>Price</Text>
          </Col>
          <Col span={14}>
            <InputNumber
              style={{ width: '100%' }}
              // addonAfter={user?.selectedToken?.ticker}
              defaultValue={order?.price}
              placeholder="1"
              value={order.price}
              onChange={val => setOrder(_order => ({ ..._order, price: val }))}
            />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '20px', height: '100%' }}>
        <Col span={24}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Button type="primary" onClick={() => submit()}>
              Proceed
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
