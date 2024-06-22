import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useState } from 'react';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { useAxios } from '../../contexts/AxiosContext';
import { useToast } from '../../contexts/ToastContext';

const Profile = ({currentUser, setCurrentUser}) => {
  const axiosService = useAxios();
  const showToast = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    newPasswordLengthValid: false,
    newPasswordSpecialCharValid: false,
    newPasswordUpperCaseValid: false,
    newPasswordNumberValid: false,
    newPasswordConfirmed: false,
  });

  console.log('currentUser::', currentUser);

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
    axiosService.post('/api/user/update', user).then((response) => {
      if(response.data.status){
        // account successfully created

        // setCurrentUser(data);
        // redirect to login page
      }
      setSaveProfileLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setSaveProfileLoading(false);
      showToast({
        severity: 'error',
        summary: 'Failed!',
        detail: 'Please fill up all fields!'
      });
    });

  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-primary text-3xl font-semibold">Profile</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Profile Details" className="flex justify-center">
            <div className="mt-[5rem] p-5 min-h-[40rem] z-0 w-[75%]">
              <div className="flex justify-center items-center">
                <div className="flex flex-col md:flex-row items-center justify-center relative">
                  <div className="flex items-center justify-center mt-[-40px] w-[130px] h-[130px] z-1 border-[10px] border-[#fff] rounded-[50%] shadow-md overflow-hidden">
                    <Avatar color="white" icon="pi pi-user" size="xlarge" shape="square" style={{ backgroundColor: '#CDCECF', width:'130px', height:'130px' }} />
                  </div>
                  <div className="absolute bottom-[25px] right-[25px] transform translate-x-1/2 translate-y-1/2">
                    <label htmlFor="upload" className="flex items-center justify-center bg-gray-100 h-[36px] w-[36px] rounded-[100%] hover:bg-primaryS hover:text-white cursor-pointer">
                      <i className='pi pi-camera hover:text-white'></i>
                    </label>
                    <input id="upload" type="file" style={{ display: 'none' }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-[3rem] mt-[5rem]">
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
              <div className="mt-[5rem] flex justify-end">
                <Button label="Save" onClick={handleOnSubmit} className="bg-primaryS rounded-lg border-primaryS ring-0 mr-2" autoFocus />

              </div>
            </div>
          </TabPanel>
          <TabPanel header="Password Settings" className="flex justify-center">
            <div className="relative p-3 mt-[5rem] w-full md:w-[50%]">
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
                  <Password required id="password" inputClassName="w-full text-sm" placeholder="New Password" feedback={false} className="text-sm" autoComplete="new-password"/>
                </div>
                <div className='flex-col flex'>
                  <label htmlFor="password_confirmation" className="font-semibold">Confirm Password</label>
                  <Password required id="password_confirmation" inputClassName="w-full text-sm" placeholder="Confirm Password" feedback={false} className="text-sm" autoComplete="confirm-password"/>
                </div>
              </div>
              
              <div className="mt-[5rem] flex justify-end">
                <Button label="Save" className="bg-primaryS rounded-lg border-primaryS ring-0 mr-2" autoFocus />
              </div>
            </div>
          </TabPanel>
        </TabView>

      </div>
    </div>
  );
}

export default Profile;