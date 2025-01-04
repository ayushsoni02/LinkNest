
import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import Card from '../components/Card'
import CreateContentModel from '../components/CreateContentModel'
import { Plusicon } from '../icons/PlusIcon'
import ShareIcon from '../icons/ShareIcon'
import Sidebar from '../components/Sidebar'
import {useContent} from '../hooks/UseContent'
import axios from 'axios'
import { BACKEND_URL } from '../Config'



function Dashboard() {
const [modelOpen,setModelOpen] = useState(false);
const {contents, refresh} = useContent();

useEffect(() => {
    refresh();
  }, [modelOpen])


  return (
   <div>
    <Sidebar/>
    <div className='p-4 ml-72 min-h-screen bg-gray-100 border-3'>
   <CreateContentModel open={modelOpen} onClose={()=>{
    setModelOpen(false);
   }} />
    <div className='flex justify-end gap-4'>
  <Button onClick={()=>{
    setModelOpen(true);
  }} variant="primary" text="Add content"  startIcon={<Plusicon/>}></Button>
     <Button onClick={async () => {
              const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`, {
                  share: true
              }, {
                  headers: {
                      "Authorization": localStorage.getItem("token") 
                  }
              });
              const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
              alert(shareUrl);
          }} variant="secondary" text="Share brain" startIcon={<ShareIcon />} />
   </div>

   
  <div className='flex gap-4 flex-wrap pt-8'>
    {contents.map(({type,link,title}) => (
    <Card 
    type={type} 
    link={link} 
    title={title} 
    />
    ))}
  </div>
  </div>
  </div>
  );
}

export default Dashboard

