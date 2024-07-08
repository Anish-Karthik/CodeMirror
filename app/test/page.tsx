import { default as axios } from 'axios';

const page = async () => {
  const res = await axios.post('http://localhost:3001/');
  console.log(res.data);
  return <div></div>;
};

export default page;
