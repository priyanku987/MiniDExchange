/* eslint-disable react/no-array-index-key */
import { Select } from 'antd';

const { Option } = Select;

export default function TokenSelector({ tokens, user, selectToken }) {
  console.log('tokens', tokens);
  return (
    <Select
      defaultValue={user?.selectedToken?.token_address}
      style={{ width: '100%' }}
      onChange={val => {
        console.log('val', val);
        console.log(tokens);
        const newSelectedToken = tokens.find(
          token => token?.token_address === val,
        );
        selectToken(newSelectedToken);
      }}
      value={user?.selectedToken?.token_adress}
      size="large"
    >
      {tokens.length > 0
        ? tokens.map((token, t) => (
            <Option value={token.token_address} key={t}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <img
                  src={token.logo}
                  alt=""
                  style={{ width: '25px', marginRight: '10px' }}
                />
                {token?.ticker}
              </div>
            </Option>
          ))
        : []}
    </Select>
  );
}
