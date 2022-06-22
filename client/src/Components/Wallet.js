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

export default function Wallet({ user, deposit, withdraw }) {
  const [operation, setOperation] = useState('DEPOSIT');
  const [amount, setAmount] = useState(0);

  const submit = () => {
    console.log(amount);
    if (operation === 'DEPOSIT') {
      deposit(amount);
    } else {
      withdraw(amount);
    }
  };
  return (
    <Card hoverable style={{ borderRadius: '8px', height: '440px' }} bordered>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={3}>Wallet</Title>
          <Divider style={{ marginTop: '0px', marginBottom: '0px' }} />
        </Col>

        <Col span={22}>
          <Text style={{ fontSize: '18px', fontWeight: 600, color: '#001628' }}>
            Token Balance for {user?.selectedToken?.ticker}
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={10}>
          <Text style={{ color: '#001628' }}>Wallet Balance</Text>
        </Col>
        <Col span={14}>
          <Text style={{ color: '#001628' }}>
            {user?.balances?.tokenWallet}
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={10}>
          <Text style={{ color: '#001628' }}>DEx Balance</Text>
        </Col>
        <Col span={14}>
          <Text style={{ color: '#001628' }}>{user.balances.tokenDex}</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Title level={4} style={{ color: '#001628' }}>
            Transfer {user?.selectedToken?.ticker}
          </Title>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={8}>
          <Text style={{ color: '#001628' }}>Operation</Text>
        </Col>
        <Col span={16}>
          <Radio.Group
            defaultValue={operation}
            buttonStyle="solid"
            style={{ width: '100%' }}
            onChange={e => setOperation(e.target.value)}
          >
            <Radio.Button
              value="DEPOSIT"
              style={{ width: '50%', textAlign: 'center' }}
            >
              Deposit
            </Radio.Button>
            <Radio.Button
              value="WITHDRAW"
              style={{ width: '50%', textAlign: 'center' }}
            >
              Withdraw
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={8}>
          <Text style={{ color: '#001628' }}>Amount</Text>
        </Col>
        <Col span={16}>
          <InputNumber
            addonAfter={user?.selectedToken?.ticker}
            defaultValue={100}
            placeholder="1"
            value={amount}
            onChange={val => setAmount(val)}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
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
