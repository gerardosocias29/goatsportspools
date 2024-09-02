import { Link, useNavigate } from "react-router-dom";
import { useAxios } from "../../contexts/AxiosContext";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Password } from "primereact/password";
import { Button } from "primereact/button";

const ContactUs = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const data = {
    name: '',
    email: '',
    message: '',
  }

  const [contactUs, setContactUs] = useState(data);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axiosService.post('/api/contact-us/send', contactUs).then((response) => {
      if(response.data.status){
        showToast({
          severity: 'success',
          summary: 'Sucess!',
          detail: response.data.message
        });
        navigate('/login');
      } else {
        showToast({
          severity: 'error',
          summary: 'Failed!',
          detail: response.data.message
        });
      }
      setLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setLoading(false);
    });

  }


  const handleInputChange = (e, target) => {
    setContactUs((prevUser) => ({
      ...prevUser,
      [target]: e.target.value
    }));
  }

  return (
    <>
      <div className="flex flex-col gap-5 p-5">
        <div className='flex justify-center items-center min-h-screen text-sm p-4 bg-[#fff]'>
          <div className="w-full xl:w-1/3 lg:w-1/2 rounded-[56px] min-h-[500px] p-1" style={{background: 'linear-gradient(180deg, rgb(16 12 68) 100%, rgba(33, 150, 243, 0) 30%)'}}>
            <div className="rounded-[53px] bg-white border-5 border-transparent w-full h-full lg:p-[5rem] p-[2rem]">
              <div className="flex flex-col items-center justify-center gap-1 mb-[2rem]">
                <img src="https://goatsportspools.com/img/favicon.png" width={100} height={100}/>
                <p className="text-2xl text-center font-bold">Submit any inquiries or questions</p>
              </div>
              <form method="POST" onSubmit={handleOnSubmit}>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 lg:col-span-2">
                    <label htmlFor="name" className="font-semibold">Your Name</label>
                    <InputText required id="name" value={contactUs.name} placeholder="Your name" onChange={(e) => handleInputChange(e, 'name')} className="text-sm rounded-lg" autoComplete="off"/>
                  </div>
                  <div className="flex flex-col gap-1 lg:col-span-2">
                    <label htmlFor="email" className="font-semibold">Your Email</label>
                    <InputText required id="email" keyfilter={'email'} value={contactUs.email} placeholder="Your email" onChange={(e) => handleInputChange(e, 'email')} className="text-sm rounded-lg" autoComplete="off"/>
                  </div>
                  <div className="flex flex-col gap-1 lg:col-span-2">
                    <label htmlFor="message" className="font-semibold">Your Message</label>
                    <InputTextarea required id="message" value={contactUs.message} placeholder="Your message" onChange={(e) => handleInputChange(e, 'message')} className="text-sm rounded-lg" autoComplete="new-message"/>
                  </div>
                  <div className="lg:col-span-2 flex justify-center">
                    <Button loading={loading} type="submit" label="Submit" className="rounded-lg ring-0 bg-primary border-none" />
                  </div>
                </div> 
              </form> 
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactUs;