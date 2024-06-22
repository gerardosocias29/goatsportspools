import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useAxios } from "../../contexts/AxiosContext";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, apiToken} = useContext(AuthContext); 
  const axiosService = useAxios();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const showToast = useToast();

  const handleOnSubmit = (e) => {
    e.preventDefault();

    console.log(email, password, rememberMe);
    // login(email);
    const data = {
      email: email,
      password: password,
      rememberMe: rememberMe
    }

    axiosService.post('/api/login', data).then((response) => {
      const token = response.data.token;
      login(token);
    }).catch((error) => {
      console.log(error);
    });
  }

  const verifyToken = () => {
    axiosService.get('/api/validate_token').then((response) => {
      if(response.data.status){
        showToast({
          severity: 'success',
          summary: 'Authenticated!',
          detail: 'Login Successful!'
        });
        const t = setTimeout(() => {
          clearTimeout(t);
          navigate('/main?page=dashboard');
        }, 2000)
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    if (isLoggedIn && apiToken) {
      // window.location.replace('/main?page=dashboard');
      verifyToken();
    }
  }, [isLoggedIn, apiToken]);

  return ( 
    <div className='flex justify-center items-center min-h-screen w-screen text-sm p-4 bg-[#fff]'>
      <div className="w-full xl:w-1/3 lg:w-1/2 rounded-[56px] min-h-[500px] p-1" style={{background: 'linear-gradient(180deg, rgb(16 12 68) 100%, rgba(33, 150, 243, 0) 30%)'}}>
      {/* <div className="w-full xl:w-1/3 lg:w-1/2 rounded-[56px] h-[500px] p-1" style={{background: 'linear-gradient(180deg, rgb(16 12 68) 10%, rgba(33, 150, 243, 0) 30%)'}}> */}
        <div className="rounded-[53px] bg-white border-5 border-transparent w-full h-full lg:p-[5rem] p-[3rem]">
          <div className="flex flex-col items-center justify-center gap-1 mb-[2rem]">
            <img src="https://goatsportspools.com/img/favicon.png" width={100} height={100}/>
            <p className="text-2xl text-center font-bold">Welcome to GoatSportsPools</p>
            <p className="text-center">Sign in to continue</p>
            {/* <a href="https://goatsportspools.com/" className="px-4 py-1 bg-gray-200 rounded-full">https://goatsportspools.com/</a> */}
          </div>
          <form method="POST" onSubmit={handleOnSubmit}>
            <div className="grid lg:grid-cols-1 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-semibold">Email Address</label>
                <InputText required id="email" type="email" keyfilter="email" value={email} placeholder="Email address" onChange={(e) => setEmail(e.target.value)} className="text-sm" autoComplete="new-email"/>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="font-semibold">Password</label>
                <Password required id="password" inputClassName="w-full text-sm" value={password} placeholder="Password" feedback={false} tabIndex={1} onChange={(e) => setPassword(e.target.value)} className="text-sm" autoComplete="new-password"/>
              </div>
              <div className="flex justify-between gap-1">
                <div className="flex items-center">
                  <Checkbox inputId="remember_me" name="remember_me" onChange={e => setRememberMe(e.checked)} checked={rememberMe}></Checkbox>
                  <label htmlFor="remember_me" className="ml-2">Remember Me</label>
                </div>
                <div>
                  <a className="text-semibold hover:underline hover:text-background" href="">Forgot password?</a>
                </div>
              </div>
              
              <div>
                <Button type="submit" className="w-full bg-background border-none hover:bg-primaryS hover:border:border-primaryS text-sm" label="Login"/>
              </div>

              <div>
                Don't have an account? <Link to="/signup" className="text-semibold hover:underline hover:text-background">Register now</Link>
              </div>
              <div className="flex items-center mt-4 mb-4">
                <div className="border-t border-gray-400 flex-grow mr-3"></div>
                <span className="text-gray-500">OR</span>
                <div className="border-t border-gray-400 flex-grow ml-3"></div>
              </div>
              <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                <div className="flex items-center justify-center gap-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
                  </svg>
                  Login with Google
                </div>
              </button>
            </div> 
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
