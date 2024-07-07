const Dashboard = () => {
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 text-primary text-3xl font-semibold">Dashboard</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px] border-l-[5px] border-l-primaryS">
            <div className="flex justify-between mb-3">
              <div className="w-full">
                <span className="text-500 font-medium mb-3">Leagues Joined</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl text-center">{0}</p>
                      <span className="text-sm min-w-[60px] text-center font-bold">Joined</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-trophy text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px] border-l-[5px] border-l-red-500">
            <div className="flex justify-between mb-3">
              <div className="w-full">
                <span className="text-500 font-medium mb-3">Amount at Risk</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center text-red-500">
                      <p className="text-4xl text-center">{0}</p>
                      <span className="text-sm min-w-[60px] text-center font-bold">Risking</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-dollar text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 