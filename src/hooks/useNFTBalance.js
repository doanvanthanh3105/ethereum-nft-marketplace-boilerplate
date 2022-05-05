import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import { useEffect, useState } from 'react';
import {
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
  useMoralisQuery,
} from 'react-moralis';
import { useIPFS } from './useIPFS';

export const useNFTBalance = (options) => {
  const { account } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTBalance, setNFTBalance] = useState([]);
  const {
    fetch: getNFTBalance,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, limit: 10 });
  const [fetchSuccess, setFetchSuccess] = useState(true);
  const queryItemImages = useMoralisQuery('ItemImages');
  const fetchItemImages = JSON.parse(
    JSON.stringify(queryItemImages.data, [
      'nftContract',
      'tokenId',
      'name',
      'image',
    ])
  );

  useEffect(async () => {
    if (data?.result) {
      console.log(data.result);
      const NFTs = data.result;
      setFetchSuccess(true);
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
          NFT.surName = NFT.metadata?.name;
          NFT.description = NFT.metadata?.description;
        } else if (NFT?.token_uri) {
          try {
            await fetch(NFT.token_uri).then((response) => {
              NFT.image = response.url;
            });
            // .then((data) => {
            //   NFT.image = resolveLink(data.image);
            // });
          } catch (error) {
            setFetchSuccess(false);
          }
        } else {
          const foo = fetchItemImages.find(
            (item) =>
              item.nftContract === NFT.token_address &&
              item.tokenId === NFT.token_id
          );

          NFT.image = foo?.image;
          NFT.name = foo?.name;
        }
      }
      setNFTBalance(NFTs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return { getNFTBalance, NFTBalance, fetchSuccess, error, isLoading };
};
