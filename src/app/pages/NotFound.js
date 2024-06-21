const NotFound = () => {
  return (
    <div className='flex justify-center items-center min-h-screen text-sm p-4 bg-[#eff2f8]'>
      <div className="w-full xl:w-1/3 lg:w-1/2 rounded-[56px] h-[500px] p-1" style={{background: 'linear-gradient(180deg, rgb(255 188 80) 10%, rgba(33, 150, 243, 0) 30%)'}}>
        <div className="rounded-[53px] bg-white border-5 border-transparent w-full h-full lg:p-[4rem] p-5">
          <div className="flex flex-col justify-center gap-1 mb-[3rem]">
            <p className="text-2xl text-center">Page Not Found</p>
            <p className="text-center">Sorry, we couldn't find what you were looking for.</p>
          </div>
          <div className="flex justify-center">
            <img alt="PageNotFound" src="/assets/images/asset-access.svg"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;