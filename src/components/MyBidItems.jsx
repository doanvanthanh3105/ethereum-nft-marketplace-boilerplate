import { Card, Image, Tooltip, Modal, Badge, Alert, Spin, Input } from 'antd';
import {
  FileSearchOutlined,
  RightCircleOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { getNativeByChain } from 'helpers/networks';
import { getEllipsisTxt } from 'helpers/formatters';
import { getExplorer } from 'helpers/networks';
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import React, { useState, useEffect } from 'react';
import { useWeb3ExecuteFunction } from 'react-moralis';

const { useMoralis, useMoralisQuery } = require('react-moralis');

const styles = {
  NFTs: {
    display: 'flex',
    flexWrap: 'wrap',
    WebkitBoxPack: 'start',
    justifyContent: 'flex-start',
    margin: '0 auto',
    maxWidth: '1000px',
    gap: '10px',
  },
};
const { Meta } = Card;

function MyBidItems() {
  const fallbackImg =
    'data:image/png;base64,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';
  const { Moralis } = useMoralis();
  const {
    chainId,
    marketAddress,
    contractABI,
    walletAddress,
    auctionAddress,
    auctionContractABI,
  } = useMoralisDapp();
  const nativeName = getNativeByChain(chainId);
  const [loading, setLoading] = useState(false);
  const [visible, setVisibility] = useState(false);

  const [nftToBuy, setNftToBuy] = useState(null);
  const queryItemImages = useMoralisQuery('ItemImages');
  const fetchItemImages = JSON.parse(
    JSON.stringify(queryItemImages.data, [
      'nftContract',
      'tokenId',
      'name',
      'image',
    ])
  );

  const contractProcessor = useWeb3ExecuteFunction();

  const endBidFunction = 'endBid';
  const queryBidItems = useMoralisQuery('MyBidItems');
  const fetchBidItems = JSON.parse(
    JSON.stringify(queryBidItems.data, [
      'objectId',
      'updatedAt',
      'currentPrice',
      'startPrice',
      'nftContract',
      'itemId',
      'end',
      'tokenId',
      'seller',
      'currentBidder',
    ])
  ).filter(
    (item) => item.end === false && item.seller.toLowerCase() == walletAddress
  );

  async function endBid() {
    setLoading(true);
    const ops = {
      contractAddress: auctionAddress,
      functionName: endBidFunction,
      abi: auctionContractABI,
      params: {
        nftContract: nftToBuy.nftContract,
        itemId: nftToBuy.itemId,
      },
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log('success');
        setLoading(false);
        setVisibility(false);
        updateBidItem();
        succPurchase();
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        failPurchase();
      },
    });
  }

  async function updateBidItem() {
    const id = getBidItem(nftToBuy).objectId;
    console.log(id);
    const bidList = Moralis.Object.extend('MyBidItems');

    const query = new Moralis.Query(bidList);
    await query.get(id).then((obj) => {
      console.log(obj);
      obj.set('end', true);
      obj.save();
    });
  }

  function getBidItem(nft) {
    const result = fetchBidItems?.find((e) => e.objectId === nft?.objectId);

    return result;
  }

  function succPurchase() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: 'Success!',
      content: `You have purchased this NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failPurchase() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: 'Error!',
      content: `There was a problem when purchasing this NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  const handleBuyClick = async (nft) => {
    setNftToBuy(nft);
    setVisibility(true);
  };

  function getImage(addrs, id) {
    const img = fetchItemImages.find(
      (element) => element.nftContract === addrs && element.tokenId === id
    );
    return img?.image;
  }

  function getName(addrs, id) {
    const img = fetchItemImages.find(
      (element) => element.nftContract === addrs && element.tokenId === id
    );
    return img?.name;
  }

  function getPrice(nft) {
    if (nft.currentPrice > nft.startPrice) return nft.currentPrice;
    return nft.startPrice;
  }

  return (
    <div style={styles.NFTs}>
      {fetchBidItems?.slice(0, 20).map((nft, index) => (
        <Card
          onClick={() => {
            console.log(nft);
          }}
          hoverable
          actions={[
            <Tooltip title='View On Blockexplorer'>
              <FileSearchOutlined onClick={() => console.log('a')} />
            </Tooltip>,
            <Tooltip title='End Bid'>
              <ShoppingCartOutlined onClick={() => handleBuyClick(nft)} />
            </Tooltip>,
          ]}
          style={{ width: 240, border: '2px solid #e7eaf3' }}
          cover={
            <Image
              preview={false}
              src={getImage(nft.nftContract, nft.tokenId) || 'error'}
              fallback={fallbackImg}
              alt=''
              style={{ height: '240px' }}
            />
          }
          key={index}>
          {<Badge.Ribbon text='in auction' color='green'></Badge.Ribbon>}
          <Meta
            title={getPrice(nft) / ('1e' + 18) + '  MATIC'}
            description={`${getName(nft.nftContract, nft.tokenId)}`}
          />
        </Card>
      ))}
      <Modal
        title={`Buy ${getName(nftToBuy?.nftContract, nftToBuy?.tokenId)} #${
          nftToBuy?.tokenId
        }`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => endBid()}
        okText='End Bid'>
        <Spin spinning={loading}>
          <div
            style={{
              width: '250px',
              margin: 'auto',
            }}>
            <Badge.Ribbon
              color='green'
              text={`${nftToBuy?.currentPrice / ('1e' + 18)} ${nativeName}`}>
              <img
                src={getImage(nftToBuy?.nftContract, nftToBuy?.tokenId)}
                style={{
                  width: '250px',
                  borderRadius: '10px',
                  marginBottom: '15px',
                }}
              />
            </Badge.Ribbon>
          </div>
        </Spin>
      </Modal>
    </div>
  );
}

export default MyBidItems;
