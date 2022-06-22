/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/jsx-no-useless-fragment */
import { Table, Card, Row, Col } from 'antd';
import Moment from 'react-moment';

function BuyOrders({ buyOrders }) {
  const dummy = [
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },

    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
    {
      amount: 50,
      filled: 30,
      price: 400,
      date: 2424232524,
    },
  ];
  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (text, buyorder) => <>{buyorder?.amount - buyorder?.filled}</>,
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
      scroll={{ y: 240 }}
      title={() => <>All Buy Orders</>}
    />
  );
}

function SellOrders({ sellOrders }) {
  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (text, sellorder) => <>{sellorder?.amount - sellorder?.filled}</>,
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
      scroll={{ y: 240 }}
      title={() => <>All Sell Orders</>}
    />
  );
}

export default function AllOrders({ orders }) {
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
