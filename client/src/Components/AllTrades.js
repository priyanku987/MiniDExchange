/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-unused-vars */
import { Table, Card, Row, Col } from 'antd';
import Moment from 'react-moment';

function TraderList({ trades }) {
  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (text, trade) => <>{trade.amount}</>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text, trade) => (
        <>
          <Moment fromNow>{parseInt(trade?.date, 10) * 1000}</Moment>
        </>
      ),
    },
  ];
  return (
    <Table
      key="trade_id"
      columns={columns}
      dataSource={trades}
      pagination={false}
      scroll={{ y: 240 }}
      title={() => <>All Trades</>}
    />
  );
}

export default function AllTrades({ trades }) {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <TraderList trades={trades} />
      </Col>
    </Row>
  );
}
