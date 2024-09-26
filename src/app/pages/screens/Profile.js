import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useContext, useState } from 'react';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { useAxios } from '../../contexts/AxiosContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';

const Profile = ({currentUser, setCurrentUser}) => {
  const axiosService = useAxios();
  const showToast = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [savePasswordLoading, setSavePasswordLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  const [passwordValidation, setPasswordValidation] = useState({
    newPasswordLengthValid: false,
    newPasswordSpecialCharValid: false,
    newPasswordUpperCaseValid: false,
    newPasswordNumberValid: false,
    newPasswordConfirmed: false,
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    password_confirmation: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevState => ({
      ...prevState,
      [name]: value
    }));

    const newPassword = name === 'password' ? value : passwordData.password;
    const confirmPassword = name === 'password_confirmation' ? value : passwordData.password_confirmation;

    const newPasswordLengthValid = newPassword.length >= 8;
    const newPasswordSpecialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const newPasswordUpperCaseValid = /[A-Z]/.test(newPassword);
    const newPasswordNumberValid = /[0-9]/.test(newPassword);
    const newPasswordConfirmed = newPassword === '' ? false : newPassword === confirmPassword;

    setPasswordValidation({
      newPasswordLengthValid,
      newPasswordSpecialCharValid,
      newPasswordUpperCaseValid,
      newPasswordNumberValid,
      newPasswordConfirmed,
    });
  };

  const [user, setUser] = useState(currentUser);

  const handleInputChange = (e, target) => {
    setUser((prevUser) => ({
      ...prevUser,
      [target]: e.target.value
    }));
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setSaveProfileLoading(true);
    axiosService.post('/api/user/update_profile', user).then((response) => {
      if(response.data.status){
        showToast({
          severity: 'success',
          summary: 'Success!',
          detail: response.data.message
        });
        setCurrentUser(response.data.user);
        setUser(response.data.user);
      } else {
        showToast({
          severity: 'error',
          summary: 'Unable to Complete!',
          detail: 'Please fill up all fields!'
        });
      }
      setSaveProfileLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setSaveProfileLoading(false);
    });

  }

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(value => value === true);
  };

  const handlePasswordOnSubmit = (e) => {
    e.preventDefault();
    if(isPasswordValid()){
      setSavePasswordLoading(true);
      axiosService.post('/api/user/update_password', passwordData).then((response) => {
        if(response.data.status){
          showToast({
            severity: 'success',
            summary: 'Success!',
            detail: response.data.message
          });
          logout();
        } else {
          showToast({
            severity: 'error',
            summary: 'Unable to Complete!',
            detail: 'Unable to update your password!'
          });
        }
        setSavePasswordLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setSavePasswordLoading(false);
      });
    } else {
      showToast({
        severity: 'error',
        summary: 'Unable to Complete!',
        detail: 'Password must meet the requirements.'
      });
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };
  
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axiosService.post('/api/user/update_image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.status) {
        showToast({
          severity: 'success',
          summary: 'Success!',
          detail: response.data.message
        });
        setCurrentUser(response.data.user);
        setUser(response.data.user);
      } else {
        showToast({
          severity: 'error',
          summary: 'Unable to Complete!',
          detail: response.data.message
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-primary text-3xl font-semibold">Profile</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Profile Details" className="flex justify-center">
            <div className="mt-[3rem] p-5 min-h-[40rem] z-0 w-full lg:w-[75%]">
              <div className="flex justify-center items-center">
                <div className="flex flex-col md:flex-row items-center justify-center relative">
                  <div className="flex items-center justify-center mt-[-40px] w-[130px] h-[130px] z-1 border-[10px] border-[#fff] rounded-[50%] shadow-md overflow-hidden">
                    <Avatar image={user.avatar} 
                      color="white" className='cover' icon={'pi pi-user'} size="xlarge" shape="square" style={{ backgroundColor: '#CDCECF', width:'130px', height:'130px' }} />
                  </div>
                  <div className="absolute bottom-[25px] right-[25px] transform translate-x-1/2 translate-y-1/2">
                    <label htmlFor="upload" className="flex items-center justify-center bg-gray-100 h-[36px] w-[36px] rounded-[100%] hover:bg-primaryS hover:text-white cursor-pointer">
                      <i className='pi pi-camera hover:text-white'></i>
                    </label>
                    <input value={undefined} id="upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-[3rem] mt-[2rem]">
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label htmlFor="firstname" className="font-semibold">First Name</label>
                  <InputText id="firstname" value={user && user.first_name} placeholder="First name" onChange={(e) => handleInputChange(e, 'first_name')} className="text-sm" autoComplete="off"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label htmlFor="lastname" className="font-semibold">Last Name</label>
                  <InputText id="lastname" value={user && user.last_name} placeholder="Last name" onChange={(e) => handleInputChange(e, 'last_name')} className="text-sm" autoComplete="off"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label htmlFor="username" className="font-semibold">Username</label>
                  <InputText id="username" value={user && user.username} placeholder="Username" onChange={(e) => handleInputChange(e, 'username')} className="text-sm" autoComplete="new-username"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label htmlFor="phone" className="font-semibold">Phone Number</label>
                  <InputText id="phone" value={user && user.phone} placeholder="Phone number" onChange={(e) => handleInputChange(e, 'phone')} className="text-sm" autoComplete="off"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-4">
                  <label htmlFor="email" className="font-semibold">Email Address</label>
                  <InputText id="email" type="email" keyfilter="email" value={user && user.email} placeholder="Email address" onChange={(e) => handleInputChange(e, 'email')} className="text-sm" autoComplete="new-email"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-4">
                  <label htmlFor="address" className="font-semibold">Your Address</label>
                  <InputText id="address" value={user && user.address} placeholder="Your address" onChange={(e) => handleInputChange(e, 'address')} className="text-sm" autoComplete="new-email"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label htmlFor="city" className="font-semibold">City</label>
                  <InputText id="city" value={user && user.city} placeholder="City" onChange={(e) => handleInputChange(e, 'city')} className="text-sm" autoComplete="new-email"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-1">
                  <label htmlFor="state" className="font-semibold">State</label>
                  <InputText id="state" value={user && user.state} placeholder="State" onChange={(e) => handleInputChange(e, 'state')} className="text-sm" autoComplete="new-email"/>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-1">
                  <label htmlFor="zipcode" className="font-semibold">Zip Code</label>
                  <InputText id="zipcode" value={user && user.zipcode} placeholder="xxxx" onChange={(e) => handleInputChange(e, 'zipcode')} className="text-sm" autoComplete="new-email"/>
                </div>
              </div>
              <div className="mt-[1rem] flex justify-end">
                <Button loading={saveProfileLoading} label="Save" onClick={handleOnSubmit} className="bg-primaryS rounded-lg border-primaryS ring-0 mr-2" />
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Password Settings" className="flex justify-center">
            <div className="relative p-3 mt-[1rem] w-full md:w-[50%]">
              <h1 className="mb-8 flex justify-center text-[32px] font-[600]">Set your Password</h1>
              <ul className="mb-8 select-none">
                <li className="flex flex-row items-center gap-2"><i className={`pi pi-check-circle ${passwordValidation.newPasswordLengthValid ? 'text-[#75C4D0]' : 'text-[#E7E7E7]'} `}></i> <span>8 characters minimum </span> </li>
                <li className="flex flex-row items-center gap-2"><i className={`pi pi-check-circle ${passwordValidation.newPasswordSpecialCharValid ? 'text-[#75C4D0]' : 'text-[#E7E7E7]'} `}></i> <span>At least one special character (!,@,#,$,&,%,+,-) </span> </li>
                <li className="flex flex-row items-center gap-2"><i className={`pi pi-check-circle ${passwordValidation.newPasswordUpperCaseValid ? 'text-[#75C4D0]' : 'text-[#E7E7E7]'} `}></i> <span>At least one uppercase letter </span> </li>
                <li className="flex flex-row items-center gap-2"><i className={`pi pi-check-circle ${passwordValidation.newPasswordNumberValid ? 'text-[#75C4D0]' : 'text-[#E7E7E7]'} `}></i> <span>At least one number </span> </li>
                <li className="flex flex-row items-center gap-2"><i className={`pi pi-check-circle ${passwordValidation.newPasswordConfirmed ? 'text-[#75C4D0]' : 'text-[#E7E7E7]'} `}></i> <span>Confirm password matched </span> </li>
              </ul>
              <div className='flex flex-col gap-4'>
                <div className='flex-col flex'>
                  <label htmlFor="password" className="font-semibold">New Password</label>
                  <Password required id="password" name='password' inputClassName="w-full text-sm" placeholder="New Password" feedback={false} className="text-sm" autoComplete="new-password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className='flex-col flex'>
                  <label htmlFor="password_confirmation" className="font-semibold">Confirm Password</label>
                  <Password required id="password_confirmation" name='password_confirmation' inputClassName="w-full text-sm" placeholder="Confirm Password" feedback={false} className="text-sm" autoComplete="confirm-password"
                    value={passwordData.password_confirmation}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
              
              <div className="mt-[1rem] flex justify-end">
                <Button loading={savePasswordLoading} label="Save" className="bg-primaryS rounded-lg border-primaryS ring-0 mr-2" onClick={handlePasswordOnSubmit}/>
              </div>
            </div>
          </TabPanel>
        </TabView>

      </div>
    </div>
  );
}

export default Profile;