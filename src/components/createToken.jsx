import { Upload, Button, Form, Checkbox, Input, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { create } from 'ipfs-http-client';
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import {
  useWeb3ExecuteFunction,
  useMoralis,
  useMoralisFile,
} from 'react-moralis';
const { TextArea } = Input;

const client = create('https://ipfs.infura.io:5001/api/v0');

const style = {
  display: 'block',
};

function CreateToken() {
  const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
  const [fileUrl, updateFileUrl] = useState(``);
  const { chainId, createAddress, createContractABI, walletAddress } =
    useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  const { Moralis } = useMoralis();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const contractABIJson = createContractABI;
  const ItemImage = Moralis.Object.extend('ItemImages');

  async function handleFileChange(e) {
    console.log(e.file);
    const file = e.file.originFileObj;

    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      updateFileUrl(url);
      console.log(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (fileUrl == '') {
      console.log('error');
      return;
    }

    const metadata = {
      name: name,
      description: description,
      image: fileUrl,
    };

    const file = new Moralis.File('file.json', {
      base64: btoa(JSON.stringify(metadata)),
    });
    await file.saveIPFS();
    console.log(file.ipfs());

    const ops = {
      contractAddress: createAddress,
      functionName: 'mint',
      abi: contractABIJson,
      params: {
        uri: file.ipfs(),
      },
    };

    console.log(ops);

    await contractProcessor.fetch({
      params: ops,
      onSuccess: (result) => {
        console.log(result);
        addItemImage(result.events.Transfer.returnValues.tokenId);

        // setLoading(false);
        // setVisibility(false);
        // updateSoldMarketItem();
        succPurchase();
      },
      onError: (error) => {
        console.log(error);
        // setLoading(false);
        failPurchase();
      },
    });
  }

  function succPurchase() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: 'Success!',
      content: `You have created this NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failPurchase() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: 'Error!',
      content: `There was a problem when creating this NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function addItemImage(id) {
    const itemImage = new ItemImage();

    itemImage.set('image', fileUrl);
    itemImage.set('nftContract', createAddress);
    itemImage.set('tokenId', id);
    itemImage.set('name', name);

    itemImage.save();
  }

  return (
    <div>
      <Form
        name='basic'
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24, offset: 0 }}
        initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete='off'>
        <Form.Item label='Name' name='name'>
          <Input
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item label='Description' name='Description'>
          <TextArea
            rows={4}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item label='NFT Image'>
          <Upload onChange={handleFileChange} multiple={false}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
          {fileUrl && <img src={fileUrl} width='400px' height='600px' />}
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type='primary' htmlType='submit' onClick={handleSubmit}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateToken;
