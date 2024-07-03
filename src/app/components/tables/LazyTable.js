import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Sidebar } from "primereact/sidebar";
// import { NoResultFound } from "../Icons/ImgPath";
import { FilterMatchMode } from "primereact/api";
import { useAxios } from "../../contexts/AxiosContext";
import SkeletonTable from "./SkeletonTable";
import { Tooltip } from "primereact/tooltip";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useToast } from "../../contexts/ToastContext";
import { BlockUI } from 'primereact/blockui';
import { ProgressSpinner } from 'primereact/progressspinner';
import { CSVLink } from "react-csv";

const LazyTable = ({ 
  checkbox = false, columns,
    actions = false, action_types = {
      view: true,
      edit: false,
      delete: false,
      settings: false,
      sign_in: false,
    }, customActions = null, actionsClicked,
    expandableRow = false, onRowExpand, onRowCollapse, rowExpansionTemplate,
    paginator = true,
    hasOptions = false,
    api = null, apiAll = null,
    convertData, convertDataFunction, refreshTable = false, setRefreshTable = () => {},
    bulkOptions,
    filters=<></>,
    filterValues,
    setLoadingState,
    warnMessage = null,
    hasExport = false, exportOptions = {
      csv: true
    }, exportHeaders,
    setTotal,
    customActionsWidth = '200px',
    rowLimit = null,
    scrollable = false,
    scrollHeight = '400px'
  }) => {
    
  const { showToast, clearToast } = useToast();
  const axiosService = useAxios();
  const [tableData, setTableData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = [ { value: '10', name: '10'}, { value: '50', name: '50'}, { value: '100', name: '100'}, ]
  const [pageItem, setPageItem] = useState(itemsPerPage[0]);

  const [bulkItem, setBulkItem] = useState();

  const csvLinkRef = useRef(null);
  const [exportCount, setExportCount] = useState(0);
  const dt = useRef(null);

  const [exportCSVHeaders, setExportCSVHeaders] = useState(exportHeaders);
  const [exportCSVData, setExportCSVData] = useState([]);

  const exportCSV = () => {
    if(exportCount === 0){
      showToast({ severity: 'info', summary: 'Please wait!', detail: 'Export to CSV is in progress.', sticky: true, loading: true, });
      let lazyCopy = JSON.parse(JSON.stringify(lazyState));
      lazyCopy.custom_filters = dataPreparation(filterValues);  
      axiosService.get(apiAll + "?with_data=true&filter=" + JSON.stringify(lazyCopy))
      .then((response) => {
        setExportCSVData(response.data);
        clearToast()
        csvLinkRef.current.link.click();
        setExportCount(0);
        setTimeout(() => {
          showToast({ severity: 'success', summary: 'Success!', detail: 'Export CSV finished.', });
        },500);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setExportCount(0);
      });
    } else {
      showToast({ severity: 'warn', summary: 'Please wait!', detail: 'Another export is currently in progress.', });
    }
    setExportCount(exportCount + 1);
  };

  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: rowLimit && rowLimit || pageItem.value,
    page: 0,
    sortField: '',
    sortOrder: '',
    filters: {
      global: { value: '', matchMode: FilterMatchMode.CONTAINS },
    },
    custom_filters: filterValues
  });
  const dataPreparation = (filterValues) => {
    if(filterValues !== undefined && filterValues !== null &&  filterValues.date_range !== undefined && filterValues.date_range !== null && filterValues.date_range[0] !== null && filterValues.date_range[0] !== null && filterValues.date_range[0] !== undefined && filterValues.date_range[1] !== undefined){
      const filterCopy = JSON.parse(JSON.stringify(filterValues));
      const startDate = `${(filterValues.date_range[0].getMonth() + 1).toString().padStart(2, "0")}/${filterValues.date_range[0].getDate().toString().padStart(2, "0")}/${filterValues.date_range[0].getFullYear()} 00:00:00`;
      const endDate = `${(filterValues.date_range[1].getMonth() + 1).toString().padStart(2, "0")}/${filterValues.date_range[1].getDate().toString().padStart(2, "0")}/${filterValues.date_range[1].getFullYear()} 23:59:59`;
      filterCopy.date_range = [startDate, endDate];
      return filterCopy;
    }else {
      return filterValues;
    }
  };

  const renderActions = (data) => {
    return (
      <div className="flex justify-center">
        { action_types.view && <Button className="text-purple ring-0" icon="pi pi-eye" rounded text aria-label="View" onClick={(e) => actionsClicked && actionsClicked(data.id, 'view', data) }/> }
        { action_types.edit && <Button className="text-blue-500 ring-0" icon="pi pi-pencil" rounded text aria-label="Edit" onClick={(e) => actionsClicked && actionsClicked(data.id, 'edit', data) }/> }
        { action_types.settings && <Button className="text-blue-500 ring-0" icon="pi pi-cog" rounded text aria-label="Settings" onClick={(e) => actionsClicked && actionsClicked(data.id, 'settings', data) }/> }
        { action_types.delete && <Button className="text-red-500 ring-0" icon="pi pi-trash" rounded text aria-label="Trash" onClick={(e) => actionsClicked && actionsClicked(data.id, 'trash', data) }/> }
        { action_types.sign_in && <Button className="text-purple ring-0" icon="pi pi-sign-in" rounded text aria-label="Trash" onClick={(e) => actionsClicked && actionsClicked(data.id, 'login', data) }/> }
      </div>
    );
  }

  const renderTemplate = (value, template, rowData, field) => { return ( template(value, rowData, field) ) } 

  const [filterVisible, setFilterVisible] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    if(value === ''){
      setlazyState((prevState) => ({
        ...prevState,
        filters: {
          ...prevState.filters,
          global: {
            ...prevState.filters.global,
            value: value
          }
        }
      }));
    }
  };

  const onGlobalFilterEnter = (e) => {
    const value = e.target.value;
    if (e.key === 'Enter') {
      setlazyState((prevState) => ({
        ...prevState,
        filters: {
          ...prevState.filters,
          global: {
            ...prevState.filters.global,
            value: value
          }
        }
      }));
    }
  }

  const getData = () => {
    let lazyCopy = JSON.parse(JSON.stringify(lazyState));
    lazyCopy.custom_filters = dataPreparation(filterValues);

    // setBulkItem(undefined);
    // setSelectedData([]);
    // setSelectAll(false);
    axiosService.get(api + "?filter=" + JSON.stringify(lazyCopy))
      .then((response) => {
        setTotalRecords(response.data?.total);
        if (convertData) {
          if(response.data.data){
            convertDataFunction(response.data.data, setTableData);
          } else {
            setTableData(response.data.data);
          }
        } else {
          setTableData(response.data.data);
        }
        
        if(setLoadingState){
          setLoadingState(false);
        }

        if(setTotal) {
          setTotal(response.data.total)
        }
        
        setLoading(false);
        setRefreshTable(false);

        if(response.data.status === false){
          showToast({
            severity: 'error',
            summary: 'Mailbox Error!',
            detail: response.data.message,
          });
        }
      })
      .catch((error) => {
        setTotalRecords(0);
        setTableData([]);
        setLoading(false);
        console.error('Error fetching data:', error);
      });
  }

  useEffect(() => {
    setLoading(true);
    getData();
  }, [lazyState]);

  useEffect(() => {
    if(refreshTable){
      getData();
    }
  }, [refreshTable])

  const onPage = (event) => {
    event.custom_filters = dataPreparation(filterValues);
    setlazyState(event);
  };

  const onSort = (event) => {
    event.custom_filters = dataPreparation(filterValues);
    setlazyState(event);
  };

  const onFilter = (event) => {
    event['first'] = 0;
    event.custom_filters = dataPreparation(filterValues);
    setlazyState(event);
  };

  const onPageItem = (e) => {
    setPageItem(e);
    setlazyState((prevState) => ({
      ...prevState,
      rows: e.value,
      page: 0,
      first: 0,
      custom_filters: dataPreparation(filterValues)
    }));
  }

  const onBulkSelectItem = (e) => {
    setBulkItem(e);
  }

  const handleBulkAccept = () => {
    setBulkItem(undefined);
    setSelectedData([]);
    setSelectAll(false);
  }

  const confirmBulkSubmit = (bulkOption, data) => {
    confirmDialog({
      tagKey: 'lazyTableKey',
      message: `Are you sure you want to "${bulkOption.name}" the selected data?`,
      header: 'Bulk Selection Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'bg-purple rounded-lg',
      acceptLabel: 'Proceed',
      accept: () => {bulkOption.onSubmit(data); handleBulkAccept();}
    });
  };

  const handleBulkSubmit = () => {
    if(bulkItem){
      const bulkOption = bulkOptions && bulkOptions.filter((e) => e.value === bulkItem.value)[0];
      confirmBulkSubmit(bulkOption, selectedData);
    }
  }

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedData(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    setBlocked(true);
    const selectAll = event.checked;
    if (selectAll) {
      setSelectAll(true);
      if(apiAll){
        let lazyCopy = JSON.parse(JSON.stringify(lazyState));
        lazyCopy.custom_filters = dataPreparation(filterValues);  
        axiosService.get(apiAll + "?filter=" + JSON.stringify(lazyCopy))
        .then((response) => {
          setSelectedData(response.data);
          setBlocked(false);
          if(warnMessage){
            showToast({
              severity: 'warn',
              summary: 'Select All Warning!',
              detail: warnMessage
            })
          }
        })
        .catch((error) => {
          setBlocked(false);
          console.error('Error fetching data:', error);
        });
      }
    } else {
      setSelectAll(false);
      setBlocked(false);
      setSelectedData([]);
    }
  };

  const applyFilters = () => {
    setFilterVisible(false);
    setlazyState((prevValues) => ({
      ...prevValues,
      custom_filters: filterValues
    }));
  };

  const optionTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex gap-4 items-center">
          {option.icon && option.icon}
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const optionsTemplate = (option) => {
    return (
      <div className="flex gap-4 items-center">
        {option.icon && option.icon}
        <div>{option.name}</div>
      </div>
    );
  };

  const blockTemplate = () => {
    return (
      <div className="mt-[5rem] flex">
        <span className="text-[16px] text-white font-[600] flex items-center">
          <ProgressSpinner style={{width: '36px', height: '36px', marginRight:'1rem'}} strokeWidth="8" animationDuration="2s" /> 
          Please wait ...</span>
      </div>
    );
  };

  const columnExpandRow = (rowId) => {
    let copyExpanded = JSON.parse(JSON.stringify(expandedRows));
    const check = expandedRows[rowId];
    let status = true;

    if(check !== undefined && check !== null){
      status = !check;
    }

    if(status){
      setExpandedRows((prevValues) => (
        {
          ...prevValues,
          [rowId]: status
        }
      ));
    }else{
      delete(copyExpanded[rowId])
      setExpandedRows(copyExpanded);
    }
  };

  const isExpanded = (rowId) => {
    const check = expandedRows[rowId];

    return (check === undefined || check === null || check === false) ? 'MdKeyboardDoubleArrowRight' : 'MdKeyboardDoubleArrowDown';
  }

  return (
  <BlockUI blocked={blocked} className="flex items-start important-bg-white backdrop-blur-sm z-[0]" 
    // pt={{mask:{className:'bg-[rgba(0,0,0,0)]'}}}
    template={blockTemplate}>
    {/* <div className="relative h-full">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="panel bg-black rounded-lg p-5 z-[10]"></div>
      </div>
    </div> */}
    {
      hasOptions && !loading &&
      <div className="mb-4 flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="rounded-lg border border-gray w-full md:w-1/4 flex items-center">
          <i className="pi pi-search p-2 text-label"></i>
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} onKeyUp={onGlobalFilterEnter} placeholder="Search items..." className="border-none bg-transparent ring-0 w-full" />
          <i className="pi pi-question-circle search mr-2"></i><Tooltip target=".search" content={"Input search then hit Enter"}/>
        </div>
        {
          selectedData && (bulkOptions && bulkOptions?.length > 0) && selectedData.length > 0 && (
            <div className="w-full lg:w-1/4 flex items-center gap-4">
              <div className="rounded-lg border border-gray w-full">
                <Dropdown placeholder="Select Action" valueTemplate={optionTemplate} itemTemplate={optionsTemplate}  value={bulkItem?.value} onChange={onBulkSelectItem} options={bulkOptions} optionLabel="name" className="border-none ring-0 w-full bg-transparent" />
              </div>
              <Button onClick={handleBulkSubmit} disabled={!bulkItem} label="Submit" className="bg-purple rounded-lg border-purple w-[130px]" />
            </div>
          )
        }
        
        <div className="flex w-full md:w-1/2 justify-end gap-2 flex-wrap">
          <div className="flex justify-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-label">Items per page</label>
              <div className="rounded-lg border border-gray">
                <Dropdown value={pageItem.value} onChange={onPageItem} options={itemsPerPage} optionLabel="name" className="border-none ring-0 w-full bg-transparent" />
              </div>
            </div>
          </div>
          {/* <div>
            <Button className="bg-transparent text-white rounded-lg border-gray w-full md:auto" iconPos="right" label="Filter" icon="pi pi-filter" onClick={() => setFilterVisible(true)} />
            <Sidebar visible={filterVisible} position="right" onHide={() => setFilterVisible(false)}>
              <h2>Advanced Filters</h2>
              {filters}
              <div className="columns-2 mt-5">
                <div>
                  <Button className="bg-purple text-white rounded-lg border-purple w-full md:auto" label="Apply" onClick={applyFilters} />
                </div>
                <div>
                  <Button className="bg-transparent text-white rounded-lg border-gray w-full md:auto" label="Reset" onClick={undefined} />
                </div>
              </div>
            </Sidebar>
          </div> */}
          {
            hasExport && exportOptions.csv && (
              <div className="flex items-center">
                <CSVLink ref={csvLinkRef} filename="Exported Data" className="hidden bg-purple rounded-lg border-none ring-0 text-white p-2 px-4" data={exportCSVData} headers={exportCSVHeaders}>Export CSV</CSVLink>
                <Button loading={exportCount > 0} disabled={exportCount > 0} className="bg-purple rounded-lg border-none ring-0" onClick={() => exportCSV()} label="Export CSV" />
              </div>
            )
          }
          
        </div>
      </div>
    }
    {
      loading && <SkeletonTable />
    }
    {
      !loading && 
      <DataTable ref={dt} value={tableData} paginator={paginator} rows={(paginator ? (rowLimit && rowLimit || pageItem.value) : undefined)}
        lazy first={lazyState.first} totalRecords={totalRecords} onPage={onPage} onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder}
        onFilter={onFilter} filters={lazyState.filters} loading={loading}
        selectionMode={!checkbox ? null : 'checkbox'} rowHover={true} selection={selectedData} onSelectionChange={onSelectionChange} selectAll={selectAll} onSelectAllChange={onSelectAllChange}
        dataKey="id"
        onRowToggle={(e) => setExpandedRows(e.data)} expandedRows={expandedRows} onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} rowExpansionTemplate={rowExpansionTemplate}
        emptyMessage={(<>
          <div className="flex flex-col items-center gap-4 text-center justify-center">
            <p className="text-3xl">No Data Found</p>
          </div>
        </>)}
        loadingIcon={<i className="pi pi-spin pi-spinner text-purple" style={{ fontSize: '3rem' }}></i>}
        pt={{root: {className: 'rounded-lg'}, loadingOverlay: {className: 'bg-purple bg-opacity-10 rounded-lg'}}}
        scrollable={scrollable} scrollHeight={scrollHeight}
      >
        {checkbox && <Column headerClassName="bg-background text-white rounded-tl-xl rounded-bl-xl border-none" selectionMode="multiple" headerStyle={{ width: '3rem' }} />}
        {
          columns.map((col, i) => {
            const column1 = (<Column 
              key={i} 
              headerClassName={`${col.headerClassName? col.headerClassName:''} text-center bg-background text-white ${(i==0 && !checkbox ? 'rounded-tl-xl rounded-bl-xl' : '' )} ${(i === (columns.length-1) && !actions)? 'rounded-tr-xl rounded-br-xl' : ''} ${ expandableRow && col.has_expander ? '' : 'border-white border'} font-normal text-white`}
              field={col.field} 
              header={col.header}
              body={(data) => col.hasTemplate ? renderTemplate(data[col.field], col.template, data, col.field) : data[col.field]}
            />)
            return column1;
          })
        }
        {actions && !customActions && <Column headerClassName="bg-background text-white rounded-tr-lg rounded-br-lg font-normal text-white" header={'Actions'} headerStyle={{ width: '3rem' }} body={renderActions}/>}
        {actions && customActions && <Column headerClassName="bg-background text-white rounded-tr-lg rounded-br-lg font-normal text-white" header={'Actions'} headerStyle={{ width: customActionsWidth }} body={customActions}/>}
      </DataTable>
    }
    <ConfirmDialog tagKey="lazyTableKey" />
  </BlockUI>
  );
}

export default LazyTable;
