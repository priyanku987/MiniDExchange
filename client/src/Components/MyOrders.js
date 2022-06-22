/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/jsx-no-useless-fragment */
import { Table, Card, Row, Col } from 'antd';
import Moment from 'react-moment';

function BuyOrders({ buyOrders }) {
  const columns = [
    {
      title: 'Amount/filled',
      dataIndex: 'amount',
      render: (text, buyorder) => (
        <>
          {buyorder?.amount} / {buyorder?.filled}
        </>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text, buyorder) => (
        <>
          <Moment fromNow>{parseInt(buyorder?.date, 10) * 1000}</Moment>
        </>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={buyOrders}
      pagination={false}
      title={() => <>My Buy Orders</>}
      scroll={{ y: 240 }}
    />
  );
}

function SellOrders({ sellOrders }) {
  const columns = [
    {
      title: 'Amount/filled',
      dataIndex: 'amount',
      render: (text, sellorder) => (
        <>
          {sellorder?.amount} / {sellorder?.filled}
        </>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text, sellorder) => (
        <>
          {' '}
          <Moment fromNow>{parseInt(sellorder?.date, 10) * 1000}</Moment>
        </>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={sellOrders}
      pagination={false}
      title={() => <>My Sell Orders</>}
      scroll={{ y: 240 }}
    />
  );
}

export default function MyOrders({ orders }) {
  return (
    <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
      <Col span={12}>
        <BuyOrders buyOrders={orders?.buy} />
      </Col>

      <Col span={12}>
        <SellOrders sellOrders={orders?.sell} />
      </Col>
    </Row>
  );
}
