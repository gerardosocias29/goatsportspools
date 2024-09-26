import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useAxios } from "../../contexts/AxiosContext";
import { useToast } from "../../contexts/ToastContext";

const Signup = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const {isLoggedIn, apiToken} = useContext(AuthContext); 
  const [signUpLoading, setSignUpLoading] = useState(false);
  const showToast = useToast();

  const data = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    password_confirmation: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
  }

  const [user, setUser] = useState(data);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setSignUpLoading(true);
    axiosService.post('/api/register', user).then((response) => {
      if(response.data.status){
        // setUser(data);
        showToast({
          severity: 'success',
          summary: 'Sucess!',
          detail: response.data.message
        });
        navigate('/login');
      } else {
        showToast({
          severity: 'error',
          summary: 'Unable to Complete!',
          detail: response.data.message
        });
      }
      setSignUpLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setSignUpLoading(false);
    });

  }

  useEffect(() => {
    if (isLoggedIn && apiToken) {
      navigate('/main?page=dashboard');
    }
  }, [isLoggedIn, apiToken]);

  const handleInputChange = (e, target) => {
    setUser((prevUser) => ({
      ...prevUser,
      [target]: e.target.value
    }));
  }

  return (
    <div className='flex justify-center items-center min-h-screen w-screen text-sm p-4 bg-[#fff]'>
      <div className="w-full xl:w-1/3 lg:w-1/2 rounded-[56px] min-h-[500px] p-1" style={{background: 'linear-gradient(180deg, rgb(16 12 68) 100%, rgba(33, 150, 243, 0) 30%)'}}>
        <div className="rounded-[53px] bg-white border-5 border-transparent w-full h-full lg:p-[5rem] p-[3rem]">
          <div className="flex flex-col items-center justify-center gap-1 mb-[2rem]">
            <img src="https://goatsportspools.com/img/favicon.png" width={100} height={100}/>
            <p className="text-2xl text-center font-bold">Create GoatSportsPools account</p>
            <p className="text-center">Fill out your credentials</p>
          </div>
          <form method="POST" onSubmit={handleOnSubmit}>
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label htmlFor="firstname" className="font-semibold">First Name</label>
                <InputText id="firstname" value={user.first_name} placeholder="First name" onChange={(e) => handleInputChange(e, 'first_name')} className="text-sm" autoComplete="off"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label htmlFor="lastname" className="font-semibold">Last Name</label>
                <InputText id="lastname" value={user.last_name} placeholder="Last name" onChange={(e) => handleInputChange(e, 'last_name')} className="text-sm" autoComplete="off"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label htmlFor="username" className="font-semibold">Username</label>
                <InputText id="username" value={user.username} placeholder="Username" onChange={(e) => handleInputChange(e, 'username')} className="text-sm" autoComplete="new-username"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label htmlFor="phone" className="font-semibold">Phone Number</label>
                <InputText id="phone" value={user.phone} placeholder="Phone number" onChange={(e) => handleInputChange(e, 'phone')} className="text-sm" autoComplete="off"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-4">
                <label htmlFor="email" className="font-semibold">Email Address</label>
                <InputText id="email" type="email" keyfilter="email" value={user.email} placeholder="Email address" onChange={(e) => handleInputChange(e, 'email')} className="text-sm" autoComplete="new-email"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-4">
                <label htmlFor="address" className="font-semibold">Your Address</label>
                <InputText id="address" value={user.address} placeholder="Your address" onChange={(e) => handleInputChange(e, 'address')} className="text-sm" autoComplete="new-email"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label htmlFor="city" className="font-semibold">City</label>
                <InputText id="city" value={user.city} placeholder="City" onChange={(e) => handleInputChange(e, 'city')} className="text-sm" autoComplete="new-email"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-1">
                <label htmlFor="state" className="font-semibold">State</label>
                <InputText id="state" value={user.state} placeholder="State" onChange={(e) => handleInputChange(e, 'state')} className="text-sm" autoComplete="new-email"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-1">
                <label htmlFor="zipcode" className="font-semibold">Zip Code</label>
                <InputText id="zipcode" value={user.zipcode} placeholder="xxxx" onChange={(e) => handleInputChange(e, 'zipcode')} className="text-sm" autoComplete="new-email"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-4">
                <label htmlFor="password" className="font-semibold">Password</label>
                <Password id="password" inputClassName="w-full text-sm" value={user.password} placeholder="Password" feedback={false} onChange={(e) => handleInputChange(e, 'password')} className="text-sm" autoComplete="new-password"/>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-4">
                <label htmlFor="passwordc" className="font-semibold">Confirm Password</label>
                <Password id="passwordc" inputClassName="w-full text-sm" value={user.password_confirmation} placeholder="Confirm Password" feedback={false} onChange={(e) => handleInputChange(e, 'password_confirmation')} className="text-sm" autoComplete="new-password"/>
              </div>
              <div className="lg:col-span-4">
                <Button loading={signUpLoading} type="submit" className="w-full bg-background border-none hover:bg-primaryS hover:border:border-primaryS text-sm" label="Register"/>
              </div>
              <div className="lg:col-span-4">
                Already have an account? <Link to="/login" className="text-semibold hover:underline hover:text-background">Login</Link>
              </div>
            </div> 
          </form> 
        </div>
      </div>
    </div>
  );
}

export default Signup;
